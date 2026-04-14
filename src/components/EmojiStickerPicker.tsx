'use client';

import { motion } from 'framer-motion';

const emojiGroups = [
  { label: 'Smile', items: ['😀', '😂', '😍', '🤩', '😎', '🥳', '😭', '😤'] },
  { label: 'Mood', items: ['🔥', '✨', '💯', '💖', '💥', '💬', '🚀', '🌈'] },
  { label: 'People', items: ['🙌', '👏', '🤝', '🙏', '🤗', '🤔', '😴', '😇'] },
  { label: 'Objects', items: ['📌', '🎯', '📣', '💡', '🧠', '📝', '📈', '✅'] },
];

interface EmojiStickerPickerProps {
  onPick: (value: string) => void;
  compact?: boolean;
}

export default function EmojiStickerPicker({ onPick, compact = false }: EmojiStickerPickerProps) {
  const allEmojis = emojiGroups.flatMap((group) => group.items);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 ${compact ? 'text-sm' : ''}`}>
      <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Emojis
      </p>

      <div className="grid max-h-52 grid-cols-8 gap-1 overflow-y-auto pr-1">
        {allEmojis.map((item) => (
          <motion.button
            key={item}
            type="button"
            onClick={() => onPick(item)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-lg leading-none hover:border-cyan-300 hover:bg-cyan-50 dark:hover:border-cyan-700 dark:hover:bg-slate-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label={`Insert emoji ${item}`}
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
}