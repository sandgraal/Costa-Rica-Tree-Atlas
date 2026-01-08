import { z } from "zod";

// Field Trip Schema
export const spottedTreeSchema = z.object({
  slug: z.string(),
  timestamp: z.string(),
  notes: z.string(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export const fieldTripDataSchema = z.object({
  spottedTrees: z.array(spottedTreeSchema),
  currentTrip: z.string().nullable(),
});

export type FieldTripData = z.infer<typeof fieldTripDataSchema>;

// Tree Journal Schema
export const journalEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  weather: z.enum(["sunny", "cloudy", "rainy", "stormy", "foggy"]),
  temperature: z.string().optional(),
  observation: z.string(),
  leafStatus: z.enum(["green", "yellowing", "bare", "budding", "full"]),
  hasFlowers: z.boolean(),
  hasFruits: z.boolean(),
  wildlife: z.array(z.string()),
  photo: z.string().optional(),
  height: z.string().optional(),
  circumference: z.string().optional(),
  mood: z.enum(["excited", "curious", "peaceful", "amazed", "thoughtful"]),
});

export const adoptedTreeSchema = z.object({
  slug: z.string(),
  nickname: z.string(),
  adoptedDate: z.string(),
  location: z.string(),
  entries: z.array(journalEntrySchema),
  badges: z.array(z.string()),
  totalObservations: z.number(),
});

export type AdoptedTree = z.infer<typeof adoptedTreeSchema>;

// Scavenger Hunt Schema
export const completedMissionSchema = z.object({
  missionId: z.string(),
  treeSlug: z.string().optional(),
  answer: z.string().optional(),
  timestamp: z.string(),
  pointsEarned: z.number(),
  bonusPoints: z.number(),
});

export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
});

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  members: z.array(teamMemberSchema),
  completedMissions: z.array(completedMissionSchema),
  totalPoints: z.number(),
  streak: z.number(),
});

export const huntSessionSchema = z.object({
  teams: z.array(teamSchema),
  currentTeamIndex: z.number(),
  startTime: z.string(),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  activeMissions: z.array(z.string()),
  completedMissions: z.array(z.string()),
});

export type HuntSession = z.infer<typeof huntSessionSchema>;

// Classroom Schema
export const studentSchema = z.object({
  id: z.string(),
  name: z.string(),
  points: z.number(),
  lessonsCompleted: z.number(),
  badges: z.array(z.string()),
  lastActive: z.string(),
});

export const classroomSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  teacherName: z.string(),
  students: z.array(studentSchema),
  createdAt: z.string(),
});

export type Classroom = z.infer<typeof classroomSchema>;

// Student Info Schema (for ClassroomClient)
export const studentInfoSchema = z.object({
  name: z.string(),
  classroomCode: z.string(),
});

export type StudentInfo = z.infer<typeof studentInfoSchema>;

// Education Progress Schema
export const lessonProgressSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean(),
  score: z.number(),
  totalPoints: z.number(),
  completedAt: z.string().optional(),
  objectives: z.record(z.string(), z.boolean()).optional(),
});

export const educationProgressSchema = z.record(z.string(), lessonProgressSchema);

export type EducationProgress = z.infer<typeof educationProgressSchema>;
