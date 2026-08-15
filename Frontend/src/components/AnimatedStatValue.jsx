import { useCountUp } from "../hooks/useCountUp";

function AnimatedStatValue({ value }) {
  const isNumeric = typeof value === "number";

  const numericMatch = typeof value === "string" ? value.match(/[\d.]+/) : null;

  const animated = useCountUp(
    isNumeric ? value : numericMatch ? parseFloat(numericMatch[0]) : value
  );

  if (isNumeric) return <>{animated}</>;

  if (numericMatch) {
    return <>{value.replace(numericMatch[0], animated)}</>;
  }

  return <>{value}</>;
}

export default AnimatedStatValue;