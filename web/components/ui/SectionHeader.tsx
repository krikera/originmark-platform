import { motion } from "framer-motion";
import { clsx } from "clsx";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export const SectionHeader = ({ title, subtitle, className }: SectionHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5 }}
    className={clsx("text-center max-w-2xl mx-auto", className)}
  >
    <h2 className="display-xl text-ink">
      {title}
    </h2>
    <p className="mt-3 text-ink-mute body-lg">
      {subtitle}
    </p>
  </motion.div>
);
