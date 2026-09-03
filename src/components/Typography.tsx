import { Text, type TextProps } from 'react-native';

type TypographyProps = TextProps & {
  children: React.ReactNode;
  className?: string;
};

/** Títulos de destaque (Home, Login). */
export function Display({ children, className, ...props }: TypographyProps) {
  return (
    <Text className={`font-displayBold text-4xl leading-10 text-ink ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
}

/** Header de seção / tela. */
export function Heading({ children, className, ...props }: TypographyProps) {
  return (
    <Text className={`font-display text-3xl leading-9 text-ink ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
}

/** Subtítulo. */
export function Subheading({ children, className, ...props }: TypographyProps) {
  return (
    <Text
      className={`font-sansMedium text-base leading-6 text-brand-dark ${className ?? ''}`}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Corpo de texto. */
export function Body({ children, className, ...props }: TypographyProps) {
  return (
    <Text className={`font-sans text-base leading-6 text-ink-muted ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
}

/** Caption / meta. */
export function Caption({ children, className, ...props }: TypographyProps) {
  return (
    <Text className={`font-sans text-sm leading-5 text-ink-muted ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
}

/** Label de formulário / ênfase. */
export function Label({ children, className, ...props }: TypographyProps) {
  return (
    <Text className={`font-sansSemi text-base text-ink ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
}
