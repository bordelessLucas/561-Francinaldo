import { Text, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/contexts/ThemeContext';

type TypographyProps = TextProps & {
  children: React.ReactNode;
  className?: string;
};

function mergeStyle(base: TextStyle, style: TextProps['style']): TextProps['style'] {
  return style ? [base, style] : base;
}

/** Títulos de destaque (Home, Login). */
export function Display({ children, className, style, ...props }: TypographyProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      className={`font-displayBold text-4xl leading-10 ${className ?? ''}`}
      style={mergeStyle({ color: colors.ink }, style)}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Header de seção / tela. */
export function Heading({ children, className, style, ...props }: TypographyProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      className={`font-display text-3xl leading-9 ${className ?? ''}`}
      style={mergeStyle({ color: colors.ink }, style)}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Subtítulo. */
export function Subheading({ children, className, style, ...props }: TypographyProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      className={`font-sansMedium text-base leading-6 ${className ?? ''}`}
      style={mergeStyle({ color: colors.brandDark }, style)}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Corpo de texto. */
export function Body({ children, className, style, ...props }: TypographyProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      className={`font-sans text-base leading-6 ${className ?? ''}`}
      style={mergeStyle({ color: colors.inkMuted }, style)}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Caption / meta. */
export function Caption({ children, className, style, ...props }: TypographyProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      className={`font-sans text-sm leading-5 ${className ?? ''}`}
      style={mergeStyle({ color: colors.inkMuted }, style)}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Label de formulário / ênfase. */
export function Label({ children, className, style, ...props }: TypographyProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      className={`font-sansSemi text-base ${className ?? ''}`}
      style={mergeStyle({ color: colors.ink }, style)}
      {...props}
    >
      {children}
    </Text>
  );
}
