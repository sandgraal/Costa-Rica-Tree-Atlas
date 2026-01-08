import { useReducer } from "react";

// Types
export interface SpottedTree {
  slug: string;
  timestamp: string;
  notes: string;
  location?: { lat: number; lng: number };
}

export interface FieldTripState {
  spottedTrees: SpottedTree[];
  currentTrip: string | null;

  // UI state
  ui: {
    searchQuery: string;
    selectedFamily: string;
    showOnlySpotted: boolean;
    showStartModal: boolean;
    isOffline: boolean;
  };

  // Modal state
  modal: {
    selectedTree: {
      slug: string;
      title: string;
      scientificName: string;
    } | null;
    noteInput: string;
  };

  // Setup
  setup: {
    tripName: string;
  };
}

// Action types
export type FieldTripAction =
  | { type: "START_TRIP"; payload: string }
  | { type: "END_TRIP" }
  | { type: "SPOT_TREE"; payload: SpottedTree }
  | { type: "REMOVE_SPOTTED"; payload: string }
  | { type: "UPDATE_NOTE"; payload: { slug: string; note: string } }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SELECTED_FAMILY"; payload: string }
  | { type: "TOGGLE_SHOW_ONLY_SPOTTED" }
  | { type: "TOGGLE_START_MODAL" }
  | { type: "SET_OFFLINE"; payload: boolean }
  | {
      type: "OPEN_NOTE_MODAL";
      payload: {
        tree: { slug: string; title: string; scientificName: string };
        currentNote: string;
      };
    }
  | { type: "CLOSE_NOTE_MODAL" }
  | { type: "SET_NOTE_INPUT"; payload: string }
  | { type: "SET_TRIP_NAME"; payload: string }
  | {
      type: "LOAD_SAVED_DATA";
      payload: { spottedTrees: SpottedTree[]; currentTrip: string | null };
    }
  | { type: "CLEAR_ALL" };

// Initial state
const initialState: FieldTripState = {
  spottedTrees: [],
  currentTrip: null,
  ui: {
    searchQuery: "",
    selectedFamily: "all",
    showOnlySpotted: false,
    showStartModal: false,
    isOffline: false,
  },
  modal: {
    selectedTree: null,
    noteInput: "",
  },
  setup: {
    tripName: "",
  },
};

// Reducer
function fieldTripReducer(
  state: FieldTripState,
  action: FieldTripAction
): FieldTripState {
  switch (action.type) {
    case "START_TRIP":
      return {
        ...state,
        currentTrip: action.payload,
        ui: { ...state.ui, showStartModal: false },
        setup: { tripName: "" },
      };

    case "END_TRIP":
      return {
        ...state,
        currentTrip: null,
      };

    case "SPOT_TREE":
      return {
        ...state,
        spottedTrees: [...state.spottedTrees, action.payload],
      };

    case "REMOVE_SPOTTED":
      return {
        ...state,
        spottedTrees: state.spottedTrees.filter(
          (s) => s.slug !== action.payload
        ),
        modal: {
          selectedTree: null,
          noteInput: "",
        },
      };

    case "UPDATE_NOTE":
      return {
        ...state,
        spottedTrees: state.spottedTrees.map((s) =>
          s.slug === action.payload.slug
            ? { ...s, notes: action.payload.note }
            : s
        ),
        modal: {
          selectedTree: null,
          noteInput: "",
        },
      };

    case "SET_SEARCH_QUERY":
      return {
        ...state,
        ui: { ...state.ui, searchQuery: action.payload },
      };

    case "SET_SELECTED_FAMILY":
      return {
        ...state,
        ui: { ...state.ui, selectedFamily: action.payload },
      };

    case "TOGGLE_SHOW_ONLY_SPOTTED":
      return {
        ...state,
        ui: { ...state.ui, showOnlySpotted: !state.ui.showOnlySpotted },
      };

    case "TOGGLE_START_MODAL":
      return {
        ...state,
        ui: { ...state.ui, showStartModal: !state.ui.showStartModal },
      };

    case "SET_OFFLINE":
      return {
        ...state,
        ui: { ...state.ui, isOffline: action.payload },
      };

    case "OPEN_NOTE_MODAL":
      return {
        ...state,
        modal: {
          selectedTree: action.payload.tree,
          noteInput: action.payload.currentNote,
        },
      };

    case "CLOSE_NOTE_MODAL":
      return {
        ...state,
        modal: {
          selectedTree: null,
          noteInput: "",
        },
      };

    case "SET_NOTE_INPUT":
      return {
        ...state,
        modal: { ...state.modal, noteInput: action.payload },
      };

    case "SET_TRIP_NAME":
      return {
        ...state,
        setup: { tripName: action.payload },
      };

    case "LOAD_SAVED_DATA":
      return {
        ...state,
        spottedTrees: action.payload.spottedTrees,
        currentTrip: action.payload.currentTrip,
      };

    case "CLEAR_ALL":
      return {
        ...initialState,
        ui: { ...state.ui, isOffline: state.ui.isOffline }, // Preserve offline status
      };

    default:
      return state;
  }
}

// Custom hook
export function useFieldTripReducer() {
  return useReducer(fieldTripReducer, initialState);
}
