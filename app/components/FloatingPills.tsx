import {Link} from 'react-router';
import {BagIcon, ChatIcon} from '~/components/Icons';

/**
 * The two fixed pills. CHAT is a light-grey outlined square; REWARDS is the one
 * deliberate exception to the square-corner rule.
 */
export function FloatingPills() {
  return (
    <>
      <button
        type="button"
        aria-label="Open chat"
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 border border-[#D6D6D6] bg-paper px-3 py-2 text-[10px] tracking-[0.22em] text-ink uppercase lg:bottom-6 lg:left-6 lg:px-4 lg:py-3 lg:text-[11px]"
      >
        <ChatIcon />
        Chat
      </button>

      <Link
        to="/pages/community"
        prefetch="intent"
        className="is-pill fixed right-4 bottom-4 z-40 flex items-center gap-2 bg-ink px-4 py-2 text-[10px] tracking-[0.22em] text-paper uppercase lg:right-6 lg:bottom-6 lg:px-5 lg:py-3 lg:text-[11px]"
      >
        <BagIcon className="h-[14px] w-[14px]" />
        Rewards
      </Link>
    </>
  );
}
