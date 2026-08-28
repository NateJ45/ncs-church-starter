// Renders one "How This Works" help guide as a read-only pane in the Studio desk.
// The guide to show is chosen by the structure item via .options({ guideSlug }).
// Content lives in ../guides/content.tsx; this file is only the presentation layer.
//
// Why a custom component pane (not documents): the guides are part of the template
// code, so staff can't edit or delete them and every future client site inherits
// them. See docs/superpowers/specs/2026-06-01-studio-how-this-works-design.md.

import React from 'react';
import { Badge, Box, Card, Flex, Heading, Stack, Text } from '@sanity/ui';
import { guides, type GuideBlock } from '../guides/content';

// Sanity passes whatever you put in .options() through as the `options` prop.
interface PaneProps {
  options?: { guideSlug?: string };
}

// Render **bold** spans inline; everything else is plain text.
function Inline({ text }: { text: string }): React.JSX.Element {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

function NumberedRow({ n, text }: { n: number; text: string }): React.JSX.Element {
  return (
    <Flex gap={3} align="flex-start">
      <Box style={{ flex: 'none', minWidth: '1.4em' }}>
        <Text size={2} weight="semibold" muted>
          {n}.
        </Text>
      </Box>
      <Text size={2} style={{ lineHeight: 1.5 }}>
        <Inline text={text} />
      </Text>
    </Flex>
  );
}

function BulletRow({ text }: { text: string }): React.JSX.Element {
  return (
    <Flex gap={3} align="flex-start">
      <Box style={{ flex: 'none', minWidth: '1em' }}>
        <Text size={2} muted aria-hidden>
          •
        </Text>
      </Box>
      <Text size={2} style={{ lineHeight: 1.5 }}>
        <Inline text={text} />
      </Text>
    </Flex>
  );
}

function Block({ block }: { block: GuideBlock }): React.JSX.Element | null {
  switch (block.kind) {
    case 'h':
      return (
        <Box paddingTop={3}>
          <Heading as="h2" size={1}>
            {block.text}
          </Heading>
        </Box>
      );
    case 'p':
      return (
        <Text size={2} style={{ lineHeight: 1.6 }}>
          <Inline text={block.text} />
        </Text>
      );
    case 'steps':
      return (
        <Stack space={3}>
          {block.items.map((item, i) => (
            <NumberedRow key={i} n={i + 1} text={item} />
          ))}
        </Stack>
      );
    case 'bullets':
      return (
        <Stack space={3}>
          {block.items.map((item, i) => (
            <BulletRow key={i} text={item} />
          ))}
        </Stack>
      );
    case 'path':
      return (
        <Card tone="transparent" border padding={3} radius={2}>
          <Text size={1} muted style={{ lineHeight: 1.5 }}>
            <strong>Where in Studio:</strong> {block.items.join('  →  ')}
          </Text>
        </Card>
      );
    case 'callout':
      return (
        <Card tone={block.tone ?? 'primary'} padding={3} radius={2} shadow={1}>
          <Stack space={2}>
            {block.title && (
              <Text size={1} weight="semibold">
                {block.title}
              </Text>
            )}
            <Text size={1} style={{ lineHeight: 1.5 }}>
              <Inline text={block.text} />
            </Text>
          </Stack>
        </Card>
      );
    case 'seealso':
      return (
        <Text size={1} muted>
          <strong>See also:</strong> {block.items.join('  ·  ')}
        </Text>
      );
    default:
      return null;
  }
}

// The DIY badge shown under the title.
function DiyBadge({ diy }: { diy?: 'self' | 'nathan' | 'mixed' }): React.JSX.Element | null {
  if (diy === 'self') {
    return (
      <Badge tone="positive" padding={2} fontSize={1} radius={2}>
        You can do this yourself
      </Badge>
    );
  }
  if (diy === 'nathan') {
    return (
      <Badge tone="caution" padding={2} fontSize={1} radius={2}>
        Check with Nathan first
      </Badge>
    );
  }
  if (diy === 'mixed') {
    return (
      <Badge tone="primary" padding={2} fontSize={1} radius={2}>
        Mostly yourself — see the limits below
      </Badge>
    );
  }
  return null;
}

export default function GuideView(props: PaneProps): React.JSX.Element {
  const slug = props?.options?.guideSlug;
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <Box padding={4}>
        <Card padding={4} radius={2} tone="caution">
          <Text>Guide not found. Pick a topic from the list on the left.</Text>
        </Card>
      </Box>
    );
  }

  const Icon = guide.icon;

  return (
    <Box padding={4} style={{ height: '100%', overflowY: 'auto' }}>
      <Box style={{ maxWidth: 680, margin: '0 auto' }}>
        <Stack space={4}>
          {/* Header */}
          <Stack space={3}>
            <Flex gap={3} align="center">
              <Text size={4}>
                <Icon />
              </Text>
              <Heading as="h1" size={3}>
                {guide.title}
              </Heading>
            </Flex>
            <Text size={2} muted style={{ lineHeight: 1.5 }}>
              {guide.lead}
            </Text>
            <Flex>
              <DiyBadge diy={guide.diy} />
            </Flex>
          </Stack>

          <Card borderTop paddingTop={4}>
            <Stack space={4}>
              {guide.body.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
