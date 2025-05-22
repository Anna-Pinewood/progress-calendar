import React from 'react';
import { motion } from 'framer-motion';

const tickContainerVariants = {
    hidden: {
        opacity: 0,
        scale: 0.3,
    },
    visible: {
        opacity: [0, 1, 1, 1],
        scale: [0.3, 1, 1.2, 1],
        transition: {
            duration: 1.2,
            times: [0, 0.25, 0.6, 1],
            ease: "easeInOut",
        },
    },
    exit: {
        opacity: 0,
        scale: 0.5,
        transition: {
            duration: 0.4,
            ease: "easeIn",
        },
    },
};

const TickAnimation: React.FC = () => {
    const tickPathVariants = {
        hidden: {
            pathLength: 0,
            opacity: 0,
        },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { type: 'spring', duration: 0.5, bounce: 0 },
                opacity: { duration: 0.2 },
            },
        },
    };

    return (
        <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-green-500 rounded-full shadow-lg z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tickContainerVariants}
        >
            <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                    variants={tickPathVariants}
                    initial="hidden"
                    animate="visible"
                />
            </svg>
        </motion.div>
    );
};

export default TickAnimation; 