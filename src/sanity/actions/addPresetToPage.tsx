import { useCallback, useEffect, useMemo, useState } from 'react';
import { useClient, type DocumentActionComponent, type DocumentActionProps } from 'sanity';
import { AddIcon } from '@sanity/icons';
import { Box, Button, Card, Flex, Spinner, Stack, Text, useToast } from '@sanity/ui';
import { addSectionToPage, type PageOpsClient } from '../pageOps';
import { SECTION_HOST_TYPES } from '../pageBuilderConfig';

// =============================================================================
// "Add to a page..." - put a saved section onto a page
// =============================================================================
// WHY AN ACTION AND NOT A LIST. In the repos that ship the Presentation
// navigator, a saved section is added from a panel that already knows which
// page the preview is showing: one button per row, no picking. This template
// has no navigator, so the surface is reversed - you open the saved section and
// choose the page. Same verb (src/sanity/pageOps.ts), same result; only the
// direction of the question changes.
//
// It cannot live in the page's own "+ Add section" picker: that picker is built
// from schema TYPES, and a saved section is a DOCUMENT.
//
// THE WRITE GOES TO THE DRAFT, always, and the section lands at the BOTTOM of
// the page's builder array. The editor drags it where it belongs and publishes.
// A saved section that appeared on the live page the moment it was clicked
// would be a publish nobody asked for.
// =============================================================================

const API = { apiVersion: '2025-01-01' } as const;

/** How a page reads in the picker. The singleton ids are their type names. */
const PAGE_LABELS: Readonly<Record<string, string>> = {
  homePage: 'Home',
  worshipPage: "I'm New / Worship",
  aboutPage: 'About',
  beliefsPage: 'What We Believe',
  musicPage: 'Music',
  staffPage: 'Pastors & Staff',
  growPage: 'Grow',
  servePage: 'Serve',
  kidsPage: 'Kids',
  foodPage: 'Food Ministry',
  eventsPage: 'Events (index page)',
  sermonsPage: 'Sermons (index page)',
  useOurSpacePage: 'Use Our Space',
  weddingsPage: 'Weddings',
  givePage: 'Give',
  faqPage: 'FAQ',
  contactPage: 'Contact',
  privacyPage: 'Privacy Policy Page',
};

/** One pickable page. */
interface PageChoice {
  id: string;
  type: string;
  field: string;
  label: string;
  /** "Main pages" or "Custom pages", so the list reads like the desk does. */
  group: string;
}

interface PageDoc {
  _id: string;
  _type: string;
  title?: string;
  slug?: { current?: string };
  archived?: boolean;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * The pages a saved section can go on, main pages first and custom pages after.
 * Draft and published twins collapse to one row (the draft's title wins, as it
 * is the newest wording), and an archived page is left out: it is off the site,
 * so adding to it is almost certainly a misclick.
 */
function buildChoices(docs: PageDoc[]): PageChoice[] {
  const seen = new Map<string, PageDoc>();
  for (const doc of docs) {
    const id = doc._id.replace(/^drafts\./, '');
    if (!seen.has(id) || doc._id.startsWith('drafts.')) seen.set(id, doc);
  }

  const main: PageChoice[] = [];
  const custom: PageChoice[] = [];
  for (const [id, doc] of seen) {
    const field = SECTION_HOST_TYPES[doc._type];
    if (!field) continue;
    if (doc.archived === true) continue;
    if (doc._type === 'page') {
      custom.push({
        id,
        type: doc._type,
        field,
        label: doc.title || doc.slug?.current || 'Untitled page',
        group: 'Custom pages',
      });
    } else {
      main.push({
        id,
        type: doc._type,
        field,
        label: PAGE_LABELS[doc._type] || doc.title || doc._type,
        group: 'Main pages',
      });
    }
  }

  // Main pages in the order the desk lists them; custom pages by name.
  const order = Object.keys(PAGE_LABELS);
  main.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  custom.sort((a, b) => a.label.localeCompare(b.label));
  return [...main, ...custom];
}

export const AddPresetToPageAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient(API);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [choices, setChoices] = useState<PageChoice[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const doc = props.draft ?? props.published;

  // The captured section, exactly as it will be appended. A preset with an
  // empty `section` array has nothing to add, which disables the action.
  const section = useMemo(() => {
    if (!isRecord(doc) || !Array.isArray(doc.section)) return null;
    const held = doc.section[0];
    return isRecord(held) ? held : null;
  }, [doc]);

  useEffect(() => {
    if (!open) return;
    let live = true;
    client
      .fetch<PageDoc[]>('*[_type in $types]{ _id, _type, title, slug, archived }', {
        types: Object.keys(SECTION_HOST_TYPES),
      })
      .then((docs) => {
        if (live) setChoices(buildChoices(docs ?? []));
      })
      .catch((err) => {
        console.error('[add-preset-to-page] could not read the page list', err);
        if (live) setChoices([]);
      });
    return () => {
      live = false;
    };
  }, [open, client]);

  const close = useCallback(() => {
    setOpen(false);
    setChoices(null);
    props.onComplete?.();
  }, [props]);

  const add = useCallback(
    async (choice: PageChoice) => {
      if (!section) return;
      setBusyId(choice.id);
      try {
        await addSectionToPage(
          client as unknown as PageOpsClient,
          choice.id,
          choice.field,
          section,
        );
        toast.push({
          status: 'success',
          title: `Added to ${choice.label}`,
          description: 'It is at the bottom of that page. Drag it where you want it, then Publish.',
          duration: 8000,
        });
        close();
      } catch (err) {
        console.error('[add-preset-to-page] failed', err);
        toast.push({
          status: 'error',
          title: 'Could not add that saved section',
          description: 'Nothing was changed. Please try again.',
        });
      } finally {
        setBusyId(null);
      }
    },
    [client, section, toast, close],
  );

  // Every other document type keeps its publish menu exactly as it was.
  if (props.type !== 'sectionPreset') return null;

  const groups = choices
    ? ['Main pages', 'Custom pages']
        .map((title) => ({ title, rows: choices.filter((c) => c.group === title) }))
        .filter((g) => g.rows.length > 0)
    : null;

  return {
    label: 'Add to a page...',
    icon: AddIcon,
    disabled: !section,
    title: section
      ? 'Put a copy of this saved section at the bottom of a page.'
      : 'This saved section is empty. Put a section in it first.',
    onHandle: () => setOpen(true),
    dialog: open && {
      type: 'dialog' as const,
      header: 'Add to a page',
      width: 'medium' as const,
      onClose: close,
      content: (
        <Stack space={4}>
          <Text size={1} muted>
            A copy goes to the bottom of the page you pick, as a draft. Nothing changes on the live
            site until you open that page and publish it.
          </Text>
          {groups === null ? (
            <Flex align="center" gap={2} padding={2}>
              <Spinner muted />
              <Text size={1} muted>
                Reading the page list
              </Text>
            </Flex>
          ) : groups.length === 0 ? (
            <Text size={1} muted>
              No pages to add to yet.
            </Text>
          ) : (
            groups.map((group) => (
              <Stack key={group.title} space={2}>
                <Text size={1} weight="semibold" muted style={{ textTransform: 'uppercase' }}>
                  {group.title}
                </Text>
                <Stack space={1}>
                  {group.rows.map((choice) => (
                    <Card
                      key={choice.id}
                      as="button"
                      padding={3}
                      radius={2}
                      border
                      disabled={busyId !== null}
                      style={{ cursor: 'pointer', textAlign: 'left', width: '100%' }}
                      onClick={() => void add(choice)}
                    >
                      <Text size={1} textOverflow="ellipsis">
                        {busyId === choice.id ? `Adding to ${choice.label}...` : choice.label}
                      </Text>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            ))
          )}
        </Stack>
      ),
      footer: (
        <Box padding={2}>
          <Flex justify="flex-end">
            <Button mode="ghost" text="Cancel" onClick={close} disabled={busyId !== null} />
          </Flex>
        </Box>
      ),
    },
  };
};
