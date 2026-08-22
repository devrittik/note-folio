import { useEffect } from 'react';
import { Card, Stack, Text } from '@sanity/ui';
import { PatchEvent, set, useFormValue, type NumberInputProps } from 'sanity';
import { calculateReadTime } from '../../../content/readTime';

export function ReadTimeInput(props: NumberInputProps) {
  const body = useFormValue(['body']);
  const generatedReadTime = calculateReadTime(body);

  useEffect(() => {
    if (props.value !== generatedReadTime) {
      props.onChange(PatchEvent.from(set(generatedReadTime)));
    }
  }, [generatedReadTime, props.value, props.onChange]);

  return (
    <Stack gap={2}>
      <Card border padding={3} radius={1} tone="primary">
        <Text size={1} weight="semibold">
          {generatedReadTime} min read
        </Text>
      </Card>
      <Text muted size={1}>
        Generated automatically from journal text at 200 words per minute.
      </Text>
    </Stack>
  );
}
