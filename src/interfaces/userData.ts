interface UserData {
  id: string;
  name: string | null;
  image: string | null;
  discriminator: string | null;
  displayTag: boolean;
}

export type { UserData };
