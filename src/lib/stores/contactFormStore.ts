import { writable } from 'svelte/store';

// Define the Question interface based on your data structure
export interface Question {
  questionTitle: string;
  questionExploringText: string;
  mailchimpTagId: string;
  mailchimpEndpoint: string;
  showCommentBox: boolean
}

// Create a type for the store data
export interface ContactFormState {
  questions: Question[];
  loaded: boolean;
}

// Create and export the store
export const contactFormStore = writable<ContactFormState>({
  questions: [],
  loaded: false
});
