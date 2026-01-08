import { useReducer } from "react";
import type { LessonTreeData } from "@/lib/education";

// State type
export interface ConservationState {
  currentStep: number;
  selectedThreats: string[];
  selectedActions: string[];
  pledge: {
    signed: boolean;
    name: string;
  };
  quiz: {
    answers: Record<number, number>;
    feedback: Record<number, boolean>;
  };
  totalPoints: number;
  showResults: boolean;
  adoptedTree: LessonTreeData | null;
}

// Action types
export type ConservationAction =
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" }
  | { type: "SET_STEP"; payload: number }
  | { type: "TOGGLE_THREAT"; payload: string }
  | { type: "TOGGLE_ACTION"; payload: string }
  | { type: "SET_PLEDGE_NAME"; payload: string }
  | { type: "SIGN_PLEDGE" }
  | {
      type: "ANSWER_QUIZ";
      payload: {
        question: number;
        answer: number;
        isCorrect: boolean;
        points: number;
      };
    }
  | { type: "ADOPT_TREE"; payload: LessonTreeData }
  | { type: "ADD_POINTS"; payload: number }
  | { type: "FINISH_LESSON" }
  | { type: "RESET" };

// Initial state
const initialState: ConservationState = {
  currentStep: 0,
  selectedThreats: [],
  selectedActions: [],
  pledge: {
    signed: false,
    name: "",
  },
  quiz: {
    answers: {},
    feedback: {},
  },
  totalPoints: 0,
  showResults: false,
  adoptedTree: null,
};

// Reducer
function conservationReducer(
  state: ConservationState,
  action: ConservationAction
): ConservationState {
  switch (action.type) {
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 4) };

    case "PREVIOUS_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };

    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "TOGGLE_THREAT": {
      const threats = state.selectedThreats.includes(action.payload)
        ? state.selectedThreats.filter((t) => t !== action.payload)
        : state.selectedThreats.length < 3
          ? [...state.selectedThreats, action.payload]
          : state.selectedThreats;

      // Award points when selecting 3rd threat
      const addedPoints =
        threats.length === 3 && state.selectedThreats.length === 2 ? 15 : 0;

      return {
        ...state,
        selectedThreats: threats,
        totalPoints: state.totalPoints + addedPoints,
      };
    }

    case "TOGGLE_ACTION": {
      const actions = state.selectedActions.includes(action.payload)
        ? state.selectedActions.filter((a) => a !== action.payload)
        : state.selectedActions.length < 3
          ? [...state.selectedActions, action.payload]
          : state.selectedActions;

      // Award points when selecting 3rd action
      const addedPoints =
        actions.length === 3 && state.selectedActions.length === 2 ? 20 : 0;

      return {
        ...state,
        selectedActions: actions,
        totalPoints: state.totalPoints + addedPoints,
      };
    }

    case "SET_PLEDGE_NAME":
      return {
        ...state,
        pledge: { ...state.pledge, name: action.payload },
      };

    case "SIGN_PLEDGE":
      if (!state.pledge.name.trim()) return state;
      return {
        ...state,
        pledge: { ...state.pledge, signed: true },
        totalPoints: state.totalPoints + 50,
      };

    case "ANSWER_QUIZ":
      // Prevent answering the same question twice
      if (state.quiz.feedback[action.payload.question] !== undefined)
        return state;

      return {
        ...state,
        quiz: {
          answers: {
            ...state.quiz.answers,
            [action.payload.question]: action.payload.answer,
          },
          feedback: {
            ...state.quiz.feedback,
            [action.payload.question]: action.payload.isCorrect,
          },
        },
        totalPoints: action.payload.isCorrect
          ? state.totalPoints + action.payload.points
          : state.totalPoints,
      };

    case "ADOPT_TREE":
      return {
        ...state,
        adoptedTree: action.payload,
        totalPoints: state.totalPoints + 25,
      };

    case "ADD_POINTS":
      return { ...state, totalPoints: state.totalPoints + action.payload };

    case "FINISH_LESSON":
      return { ...state, showResults: true };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// Custom hook
export function useConservationReducer() {
  return useReducer(conservationReducer, initialState);
}
