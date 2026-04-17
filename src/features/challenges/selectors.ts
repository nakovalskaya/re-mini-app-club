import { challenges } from "@/data/challenges";

export function getChallenges() {
  return challenges;
}

export function getChallengeById(id: string) {
  return challenges.find((challenge) => challenge.id === id) ?? null;
}
