import type { Challenge } from "@/shared/types/content";

export function getChallenges(challenges: Challenge[]) {
  return challenges.filter((challenge) => challenge.status !== "archived");
}

export function getChallengeById(challenges: Challenge[], id: string) {
  return challenges.find((challenge) => challenge.id === id) ?? null;
}
