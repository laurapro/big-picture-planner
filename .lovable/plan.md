

## Plan: Grey out invalid days

Currently invalid days (e.g. Feb 29-31) use `bg-muted/30` which is subtle. I'll make them more visually distinct with a darker grey background and a diagonal strikethrough pattern so they clearly read as "non-existent."

### Changes

**`src/components/calendar/HorizontalCalendarGrid.tsx`** — Update the invalid day cell styling:
- Change `bg-muted/30` to `bg-muted/50` with a subtle diagonal stripe pattern using a CSS background gradient
- Add a visual indicator like darker background or hatching to make invalid days obviously greyed out

**`src/index.css`** — Add a utility class for the striped/greyed pattern if needed, or just use inline Tailwind classes.

This is a single-line styling change — straightforward and minimal.

