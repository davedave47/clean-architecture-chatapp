import { createContext, useState, ReactNode } from 'react';
import { IConversation } from "../interfaces";

// Create the context
export const ConversationContext = createContext<{
  currentConvo: IConversation | null;
  setCurrentConvo: React.Dispatch<React.SetStateAction<IConversation | null>>;
}>({
  currentConvo: null,
  setCurrentConvo: () => {},
});

// Create a provider component
export const ConversationProvider = ({ children }: {children: ReactNode}) => {
  const [currentConvo, setCurrentConvo] = useState<IConversation | null>(null);

  return (
    <ConversationContext.Provider value={{ currentConvo, setCurrentConvo }}>
      {children}
    </ConversationContext.Provider>
  );
};

