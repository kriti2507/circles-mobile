/**
 * Circle Store
 * Manages circle state and membership
 */

import { create } from 'zustand';
import type { Circle, CircleMember, Prompt, MatchingQueueStatus } from '../types';

interface CircleState {
  // State
  circle: Circle | null;
  members: CircleMember[];
  currentPrompt: Prompt | null;
  queueStatus: MatchingQueueStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCircle: (circle: Circle | null) => void;
  setMembers: (members: CircleMember[]) => void;
  setCurrentPrompt: (prompt: Prompt | null) => void;
  setQueueStatus: (status: MatchingQueueStatus | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Circle actions
  joinQueue: () => void;
  leaveQueue: () => void;
  leaveCircle: () => void;
  memberJoined: (member: CircleMember) => void;
  memberLeft: (userId: string) => void;

  reset: () => void;
}

const initialState = {
  circle: null,
  members: [],
  currentPrompt: null,
  queueStatus: null,
  isLoading: false,
  error: null,
};

export const useCircleStore = create<CircleState>((set, get) => ({
  ...initialState,

  setCircle: (circle) => set({ circle }),

  setMembers: (members) => set({ members }),

  setCurrentPrompt: (currentPrompt) => set({ currentPrompt }),

  setQueueStatus: (queueStatus) => set({ queueStatus }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  joinQueue: () => {
    set({
      queueStatus: {
        inQueue: true,
        joinedQueueAt: new Date().toISOString(),
      },
    });
  },

  leaveQueue: () => {
    set({ queueStatus: null });
  },

  leaveCircle: () => {
    set({
      circle: null,
      members: [],
      currentPrompt: null,
    });
  },

  memberJoined: (member) => {
    const currentMembers = get().members;
    if (!currentMembers.find((m) => m.id === member.id)) {
      set({ members: [...currentMembers, member] });
    }
  },

  memberLeft: (userId) => {
    const currentMembers = get().members;
    set({
      members: currentMembers.map((m) =>
        m.id === userId ? { ...m, status: 'left' as const } : m
      ),
    });
  },

  reset: () => set(initialState),
}));

// Selectors
export const selectCircle = (state: CircleState) => state.circle;
export const selectMembers = (state: CircleState) => state.members;
export const selectActiveMembers = (state: CircleState) =>
  state.members.filter((m) => m.status === 'active');
export const selectHasCircle = (state: CircleState) => !!state.circle;
export const selectIsInQueue = (state: CircleState) =>
  state.queueStatus?.inQueue ?? false;

export default useCircleStore;
