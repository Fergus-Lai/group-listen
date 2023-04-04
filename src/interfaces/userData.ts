interface UserData {
  id: string;
  name: string | undefined | null;
  image: string | undefined | null;
  discriminator: string | undefined | null;
  displayTag: boolean;
}

export type { UserData };
