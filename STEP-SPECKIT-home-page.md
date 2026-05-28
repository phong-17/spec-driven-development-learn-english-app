# Speckit Steps — home-page

## STEP 1: /speckit-specify

Tạo trang home tại `/` với các yêu cầu sau:

### Background
- Tiled full-page background: file `/public/images/theme.gif`, dùng CSS `background-repeat: repeat; background-size: 250px`, opacity ~0.19, `position: fixed`, `z-index: 0`.

### Layout tổng thể
- `< lg` (< 1024px): flex-col — nav bar trên cùng, main content chiếm full width bên dưới.
- `lg+` (≥ 1024px): flex-row — sidebar nav bên trái (`w-56`, sticky, `h-screen`), main content chiếm phần còn lại.

### NavigationMenu
- **`lg+` (sidebar)**: Hiện app title (`> ~/learn-english` + `LEARN ENGLISH`), dashed divider, 3 nav links với `▸` prefix. Các item animate stagger vào khi mount.
- **`< lg` (top bar)**: Hiện `> ~/learn-english` và button ASCII `[ ≡ MENU ]`. Click button → dropdown animated (motion `AnimatePresence`) hiện 3 nav links. Khi mở, button đổi thành `[ × CLOSE ]`. Click vào link thì đóng dropdown.
- 3 nav links: **Lessons** → `/lessons`, **500 Most Common Words** → `/vocabulary/500`, **1000 Topic Vocabulary** → `/vocabulary/1000`.
- Tất cả border là `border-dashed`. Không có rounded corners, shadows, gradients.

### Nội dung main (thứ tự từ trên xuống)

**1. BackgroundSection**
- Hiển thị `/public/images/background.gif` (ASCII art mèo cầm ô mưa).
- Chiều cao cố định `h-[400px]`, `object-contain`, `dark:invert`.
- Fade-in animation khi mount.

**2. HeroSection**
- Eyebrow `> ~/learn-english` (accent color) — slide từ trái vào.
- ASCII box-drawing frame trên `┌──…──┐` và dưới `└──…──┘` — animate `scaleX` từ trái sang phải khi mount.
- Title **"LEARN ENGLISH"**: infinite typewriter loop — gõ từng ký tự (70ms/ký tự) → dừng 2s → xóa từng ký tự → dừng 2s → lặp lại mãi.
- Cursor `_` (accent color) nhấp nháy liên tục (`opacity: [1,1,0,0]`, 0.9s, infinite).
- `TypingCat` component nằm **bên trái** title (flex row, `items-end`).
- Tagline text fade in sau 1.5s delay.

**3. Ba ContentSection** (`lessons`, `vocab-500`, `vocab-1000`)

Mỗi section có:
- Dashed border `foreground/30` lúc bình thường → chuyển sang `green-400` khi hover (`transition-colors duration-300`).
- Trigger hover bằng `onMouseEnter/Leave` (không dùng `motion.section`).
- Bố cục bên trong:
  - **Trái (`lg+` only)**: `TypingCat` full (2 frame animation). Hidden ở < lg.
  - **Phải**: flex-col gồm:
    - Label `[ section // {id} ]` màu muted.
    - Title (`h2`) uppercase accent color.
    - Description + Button row:
      - Description dùng invisible spacer để giữ cố định chiều cao (tránh layout shift). Khi **chưa hover**: hiện full text tĩnh. Khi **hover vào**: reset về rỗng, bắt đầu infinite typewriter giống HeroSection, có cursor `_`. Khi **hover ra**: snap lại full text ngay.
      - Button ASCII bracket `[ LABEL ]` style: `border-dashed border-accent`, text accent, hover fill từ trái sang phải (`scaleX`), text đổi sang `bg` color. Click navigate đến route tương ứng.
      - Tại **`md` only** (768–1023px): hiện **cat head** (`∧_∧` + `(=^ω^=)`) bên cạnh button. Hidden ở `< md` và `lg+`.

**TypingCat component** (`src/features/home/components/TypingCat.tsx`):
- 2 frames ASCII cat với bàn phím, xen kẽ nhau mỗi 450ms.
- Bên cạnh có text `> typing. / typing.. / typing...` — container **fixed width `w-20`** để không gây layout shift.
- `<pre>` chứa cat art cũng phải **fixed width** để không shift layout khi đổi frame.

### Placeholder pages
- `/lessons`, `/vocabulary/500`, `/vocabulary/1000`: mỗi trang render `<h1>` + "Coming soon." theo ASCII style. Không có 404.

### Hook dùng chung
- `src/features/home/hooks/useInfiniteTypewriter.ts`: nhận `(text: string, active: boolean)`. Khi `active=false` thì pause. Khi `active` chuyển từ false → true thì reset về 0 và bắt đầu lại.

> Design system rules (font VT323, border-dashed, no rounded/shadow/gradient, motion-only animation) — xem CLAUDE.md ## Design và ## Animation.

### Reference images (design guide)
- `/public/images/follow-theme.jpeg`: dashboard ASCII terminal style — layout tham khảo.
- `/public/images/follow-button.jpeg`: button style `[ LABEL ]` với accent border/fill.
- `/public/images/background.gif`: content của BackgroundSection.
- `/public/images/theme.gif`: tile background toàn trang.

## STEP 2: /speckit-clarify

## STEP 3: /speckit-plan

## STEP 4: /speckit-tasks

## STEP 5: /speckit-implement
