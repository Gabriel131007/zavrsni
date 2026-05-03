import { z } from "zod";

export const SignUpSchema = z.object({
  name:            z.string().min(2, "Ime mora imati najmanje 2 znaka"),
  email:           z.email("E-mail adresa mora biti u ispravnom obliku"),
  password:        z.string().min(6, "Zaporka mora imat najmanje 6 znakova"),
  passwordConfirm: z.string().min(6, "Potvrda zaporke je obavezna"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Zaporke se ne podudaraju",
  path: ["passwordConfirm"],
});

export const SignInSchema = z.object({
  email:    z.email("E-mail adresa mora biti u ispravnom obliku"),
  password: z.string().min(6, "Zaporka mora imat najmanje 6 znakova"),
});

export const ResetPasswordSchema = z.object({
  email: z.email("E-mail adresa mora biti u ispravnom obliku"),
});

export const ProfileSchema = z.object({
  displayName: z.string()
    .min(2, "Korisničko ime mora imati najmanje 2 znaka")
    .max(30, "Korisničko ime može imati najviše 30 znakova"),
});

export const GameSchema = z.object({
  title: z.string()
    .min(1, "Naziv igre je obavezan")
    .max(100, "Naziv može imati najviše 100 znakova"),
  description: z.string()
    .min(10, "Opis mora imati najmanje 10 znakova")
    .max(1000, "Opis može imati najviše 1000 znakova"),
  genre: z.string().min(1, "Žanr je obavezan"),
  releaseYear: z.coerce
    .number()
    .int()
    .min(1970, "Godina mora biti 1970 ili novija")
    .max(new Date().getFullYear() + 2, "Godina ne može biti toliko u budućnosti"),
  coverUrl: z.string().optional().or(z.literal("")),
});

export const ReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, "Ocjena mora biti između 1 i 10")
    .max(10, "Ocjena mora biti između 1 i 10"),
  text: z.string()
    .min(10, "Recenzija mora imati najmanje 10 znakova")
    .max(2000, "Recenzija može imati najviše 2000 znakova"),
});