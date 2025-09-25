// src/components/home/CategoryCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import './CategoryCard.css';

interface Props {
  icon: string;
  title: string;
  color: string;
}

const CategoryCard: React.FC<Props> = ({ icon, title, color }) => {
  return (
    <motion.div
      className="category-card"
      style={{ '--card-color': color } as React.CSSProperties}
      whileHover={{ y: -10, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
    </motion.div>
  );
};

export default CategoryCard;