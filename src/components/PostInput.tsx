'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import EmojiStickerPicker from './EmojiStickerPicker';

interface PostInputProps {
  onPostCreated: (post: {
    _id: string;
    content: string;
    imageUrl?: string;
    imagePublicId?: string;
    poll?: {
      question: string;
      options: {
        id: string;
        text: string;
        votes: number;
      }[];
      totalVotes: number;
    };
    upvotes: number;
    downvotes: number;
    reports: number;
    hidden: boolean;
    score: number;
    createdAt: string;
  }) => void;
  compact?: boolean;
}

export default function PostInput({ onPostCreated, compact = false }: PostInputProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [isEmojiKitOpen, setIsEmojiKitOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPollEnabled, setIsPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleContentChange = (text: string) => {
    if (text.length <= 500) {
      setContent(text);
      setCharacterCount(text.length);
    }
  };

  const insertText = (value: string) => {
    setContent((current) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        const next = `${current}${value}`.slice(0, 500);
        setCharacterCount(next.length);
        return next;
      }

      const start = textarea.selectionStart ?? current.length;
      const end = textarea.selectionEnd ?? current.length;
      const next = `${current.slice(0, start)}${value}${current.slice(end)}`.slice(0, 500);
      setCharacterCount(next.length);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = Math.min(start + value.length, next.length);
        textarea.setSelectionRange(cursor, cursor);
      });

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasImage = Boolean(selectedImage);
    const hasPoll = isPollEnabled;

    if (!content.trim() && !hasImage && !hasPoll) {
      toast.error('Add text, image, or poll to post');
      return;
    }

    if (isPollEnabled) {
      const trimmedQuestion = pollQuestion.trim();
      const normalizedOptions = pollOptions.map((option) => option.trim()).filter(Boolean);

      if (!trimmedQuestion) {
        toast.error('Please add a poll question');
        return;
      }

      if (trimmedQuestion.length > 120) {
        toast.error('Poll question must be 120 characters or less');
        return;
      }

      if (normalizedOptions.length < 2 || normalizedOptions.length > 4) {
        toast.error('Poll needs 2 to 4 options');
        return;
      }

      if (normalizedOptions.some((option) => option.length > 80)) {
        toast.error('Each poll option must be 80 characters or less');
        return;
      }

      const hasDuplicates = new Set(normalizedOptions.map((option) => option.toLowerCase())).size !== normalizedOptions.length;
      if (hasDuplicates) {
        toast.error('Poll options must be unique');
        return;
      }
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('captchaToken', '');

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      if (isPollEnabled) {
        const normalizedOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
        formData.append(
          'poll',
          JSON.stringify({
            question: pollQuestion.trim(),
            options: normalizedOptions,
          })
        );
      }

      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post published! 🎉');
      setContent('');
      setCharacterCount(0);
      setSelectedImage(null);
      setImagePreview(null);
      setIsPollEnabled(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onPostCreated(response.data);
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      if (axios.isAxiosError<{ error?: string }>(error)) {
        toast.error(error.response?.data?.error || 'Failed to post');
      } else {
        toast.error('Failed to post');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`surface-strong mb-5 rounded-3xl ${compact ? 'p-3' : 'p-4 md:p-5'}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {!compact && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
            Write a post
          </p>
          <span className="rounded-full border border-sky-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
            Fresh feed first
          </span>
        </div>
      )}

      <div className="mb-4 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Drop a confession, idea, rant, or hot take..."
          className={`w-full resize-none rounded-2xl border border-sky-200 bg-white/80 p-4 md:pr-16 text-sm text-slate-900 placeholder:font-medium placeholder:text-slate-500 placeholder:opacity-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/35 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-300 ${compact ? 'h-20' : 'h-24'}`}
          disabled={isLoading}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label="Upload image"
          title="Upload image"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setSelectedImage(file);

            if (imagePreview) {
              URL.revokeObjectURL(imagePreview);
            }

            setImagePreview(file ? URL.createObjectURL(file) : null);
          }}
          disabled={isLoading}
        />

        <div className="absolute bottom-3 right-3 hidden md:block">
          <motion.button
            type="button"
            onClick={() => setIsEmojiKitOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-white text-lg shadow-md hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-expanded={isEmojiKitOpen}
            aria-label="Open emoji picker"
            title="Emojis"
          >
            😊
          </motion.button>

          {isEmojiKitOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] shadow-2xl sm:right-0 sm:left-auto">
              <EmojiStickerPicker onPick={insertText} compact />
            </div>
          )}
        </div>
      </div>

      {imagePreview && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-sky-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="relative">
            <img src={imagePreview} alt="Selected preview" className="h-48 w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                if (imagePreview) {
                  URL.revokeObjectURL(imagePreview);
                }
                setImagePreview(null);
                setSelectedImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute right-3 top-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white"
            >
              Remove image
            </button>
          </div>
        </div>
      )}

      {isPollEnabled && (
        <div className="mb-4 rounded-2xl border border-sky-200 bg-white/70 p-3 dark:border-slate-700 dark:bg-slate-900/70">
          <div className="space-y-3">
            <input
              type="text"
              value={pollQuestion}
              onChange={(event) => setPollQuestion(event.target.value.slice(0, 120))}
              placeholder="Poll question"
              className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              disabled={isLoading}
            />

            <div className="space-y-2">
              {pollOptions.map((option, index) => (
                <div key={`poll-option-${index}`} className="flex items-center gap-2">
                  <span className="w-5 text-xs font-semibold text-slate-500 dark:text-slate-400">{index + 1}.</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(event) => {
                      const next = [...pollOptions];
                      next[index] = event.target.value.slice(0, 80);
                      setPollOptions(next);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (pollOptions.length >= 4) {
                    return;
                  }

                  setPollOptions((current) => [...current, '']);
                }}
                className="rounded-xl border border-sky-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={isLoading || pollOptions.length >= 4}
              >
                + Add option
              </button>

              <button
                type="button"
                onClick={() => {
                  if (pollOptions.length <= 2) {
                    return;
                  }

                  setPollOptions((current) => current.slice(0, -1));
                }}
                className="rounded-xl border border-sky-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={isLoading || pollOptions.length <= 2}
              >
                - Remove option
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <motion.span
          className={`text-sm font-semibold ${compact ? 'hidden sm:inline' : ''} ${
            characterCount > 450
              ? 'text-rose-500'
              : characterCount > 400
                ? 'text-amber-500'
                : 'text-slate-500 dark:text-slate-400'
          }`}
          animate={{ scale: characterCount > 400 ? 1.1 : 1 }}
        >
          {characterCount}/500
        </motion.span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
            disabled={isLoading}
          >
            🖼️ Image
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPollEnabled((current) => !current);
              if (isPollEnabled) {
                setPollQuestion('');
                setPollOptions(['', '']);
              }
            }}
            className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition-all ${
              isPollEnabled
                ? 'border-cyan-500 bg-cyan-50 text-cyan-800 dark:border-cyan-500 dark:bg-cyan-900/20 dark:text-cyan-200'
                : 'border-sky-200 bg-white/70 text-slate-700 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
            disabled={isLoading}
          >
            📊 Poll
          </button>

          <motion.button
            type="submit"
            disabled={isLoading || (!content.trim() && !selectedImage && !isPollEnabled)}
            className={`btn-primary disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'px-4 py-2 text-sm' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? '✨ Publishing...' : '✨ Post'}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
