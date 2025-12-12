import { Text } from 'react-native';
import { cn } from '../utils/cn';

type AppTextProps = {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'heading' | 'extraHeading';
  bold?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'white' | 'success';
  center?: boolean;
  className?: string;
};

export function AppText({
  children,
  size = 'medium',
  bold = false,
  color = 'primary',
  center = false,
  className,
}: AppTextProps) {
  const textColor =
    color === 'primary'
      ? '#000000'
      : color === 'secondary'
        ? '#6B7280'
        : color === 'tertiary'
          ? '#9CA3AF'
          : color === 'danger'
            ? '#FF3B30'
            : color === 'white'
              ? '#FFFFFF'
              : color === 'success'
                ? '#19C11E'
                : '#FFFFFF';

  return (
    <Text
      style={{ color: textColor }}
      className={cn(
        size === 'small' && 'text-sm',
        size === 'medium' && 'text-base',
        size === 'large' && 'text-lg',
        size === 'heading' && 'text-xl',
        size === 'extraHeading' && 'text-2xl',
        bold && 'font-bold',
        center && 'text-center',
        className,
      )}>
      {children}
    </Text>
  );
}
