import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Community {
  id: string;
  slug: string;
  avatarUrl: string | null;
  name: string;
  coachID: string | null;
}

interface CommunityState {
  selectedCommunityID: string | null;
  selectedCoachID: string | null;
  setSelectedCommunity: (communityID: string, coachID: string) => void;
  initializeFromUser: (communities: Community[]) => void;
  clearSelection: () => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      selectedCommunityID: null,
      selectedCoachID: null,

      setSelectedCommunity: (communityID: string, coachID: string) => {
        set({
          selectedCommunityID: communityID,
          selectedCoachID: coachID
        });
      },

      initializeFromUser: (communities: Community[]) => {
        const state = get();

        if (!state.selectedCommunityID ||
          !communities.find(c => c.id === state.selectedCommunityID)) {
          const firstCommunity = communities[0];
          if (firstCommunity && firstCommunity.coachID) {
            set({
              selectedCommunityID: firstCommunity.id,
              selectedCoachID: firstCommunity.coachID
            });
          }
        }
      },

      clearSelection: () => {
        set({
          selectedCommunityID: null,
          selectedCoachID: null
        });
      },
    }),
    {
      name: 'nlc-community-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
