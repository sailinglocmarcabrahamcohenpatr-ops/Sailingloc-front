export interface RatingFormValues {
  noteProprietaire: number;
  noteBateau: number;
  noteLieu: number;
  commentaire: string;
}

export const EMPTY_RATING: RatingFormValues = {
  noteProprietaire: 0,
  noteBateau: 0,
  noteLieu: 0,
  commentaire: "",
};
