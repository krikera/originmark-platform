import { motion } from "framer-motion";
import { clsx } from "clsx";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export const SectionHeader = ({ title, subtitle, className }: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6 }}
    className={clsx("text-center", className)}
  >
    <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">
      {title}
    </h2>
    <p className="mt-6 text-surface-400 sm:text-lg max-w-2xl mx-auto">
      {subtitle}
    </p>
  </motion.div>
);
