'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Action,
  Actions
  // ActionsTrigger,
  // ActionsContent,
} from '@/components/ai-elements/actions';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
// TODO: If not using @ai-sdk/react, then remove it from package.json.
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import { CopyIcon, GlobeIcon, MicIcon, Plus } from 'lucide-react';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { api } from "../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useWindowSize } from '@/lib/utils';
import { ServerMessage } from './ServerMessage';

const models = [
  {
    name: 'GPT 4o',
    value: 'openai/gpt-4o',
  },
  {
    name: 'Deepseek R1',
    value: 'deepseek/deepseek-r1',
  },
];

export default function ChatAgent() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  // const { messages, sendMessage, status } = useChat();

  const messages = useQuery(api.messages.listMessages);
  console.log("messages",messages);
  const sendMessage = useMutation(api.messages.sendMessage);
  const [inputValue, setInputValue] = useState("");
  const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set());
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    },
    [messagesEndRef]
  );

  const windowSize = useWindowSize();

  useEffect(() => {
    scrollToBottom();
  }, [windowSize, scrollToBottom]);

  if (!messages) return null;

  // TODO : make it have great UI/UX for small devices as well.
  return (
    <div className="max-w-4xl mx-auto p-2 relative size-full min-h-min overflow-hidden">
      <div className="flex flex-col h-full">
        <Conversation className="overflow-y-auto overscroll-none">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message._id}>
                <Fragment key={message._id}>
                  <Message from={message.role}>
                    <MessageContent>
                      <Response>{message.prompt}</Response>
                    </MessageContent>
                    {message.role === "assistant" && (
                      <MessageContent>
                        <ServerMessage
                          message={message}
                          isDriven={drivenIds.has(message._id)}
                          stopStreaming={() => {
                            setIsStreaming(false);
                            focusInput();
                          }}
                          scrollToBottom={scrollToBottom}
                        />
                      </MessageContent>
                    )}
                  </Message>
                  {/* {message.role === "assistant" && (
                    <Actions className="mt-2">
                      <Action
                        onClick={() => navigator.clipboard.writeText(part.text)}
                        label="Copy"
                      >
                        <CopyIcon className="size-3" />
                      </Action>
                    </Actions>
                  )} */}
                </Fragment>
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={async (e) => {
            e.preventDefault();
            if (!input.trim()) return;

            setInput("");

            const chatId = await sendMessage({
              prompt: input,
            });

            setDrivenIds((prev) => {
              prev.add(chatId);
              return prev;
            });

            setIsStreaming(true);
            console.log("Submitting with prompt:", input);
          }}
          className="mt-4 pb-4"
        >
          <PromptInputTextarea
            ref={inputRef}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton>
                <Plus size={16} />
              </PromptInputButton>
              <PromptInputButton>
                <MicIcon size={16} />
              </PromptInputButton>
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={false} status={isStreaming ? 'streaming' : 'ready'}/>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
