import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Define the ClassValue type if it's not exported by clsx
type ClassValue = string | number | boolean | undefined | null | 
  { [key: string]: any } | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
