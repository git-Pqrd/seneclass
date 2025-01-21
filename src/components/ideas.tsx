import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const topics = [
  {
    title: "Roman Republic",
    description:
      "Explore the politics and society of the late Republic of Rome",
    topic:
      "Let's discuss ancient Rome. For example, ask what SPQR means or why the Republic fell.",
    image: "/rome.jpeg",
    color: "bg-red-600",
  },
  {
    title: "Quantum Physics",
    description: "Dive into the mysterious world of quantum mechanics",
    topic:
      "Let's explore quantum physics. You could ask about the double-slit experiment or quantum entanglement.",
    image: "/quantum.jpeg",
    color: "bg-blue-600",
  },
  {
    title: "Financial Markets",
    description: "Understand the intricacies of global financial systems",
    topic:
      "Let's discuss finance. For instance, ask about stock market indices or how cryptocurrencies work.",
    image: "/finance.jpeg",
    color: "bg-green-600",
  },
  {
    title: "Artificial Intelligence",
    description: "Explore the cutting-edge field of AI and machine learning",
    topic:
      "Let's talk about AI. You might ask about neural networks or the ethical implications of AI.",
    image: "/ai.jpeg",
    color: "bg-purple-600",
  },
  {
    title: "Climate Change",
    description: "Examine the causes and impacts of global climate change",
    topic:
      "Let's discuss climate change. You could ask about greenhouse gases or potential solutions to global warming.",
    image: "/climate.jpeg",
    color: "bg-yellow-600",
  },
  {
    title: "Neuroscience",
    description: "Unravel the mysteries of the human brain",
    topic:
      "Let's discuss neuroscience. For instance, ask about neuroplasticity or the nature of consciousness.",
    image: "/brain.jpeg",
    color: "bg-pink-600",
  },
];

const TopicCard = ({
  topic,
  setTopic,
}: {
  topic: any;
  setTopic: React.Dispatch<React.SetStateAction<string>>;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="px-2"
  >
    <Card className="overflow-hidden h-full flex flex-col">
      <div className={`h-40 ${topic.color} opacity-50`}>
        <img
          src={topic.image}
          alt={topic.title}
          className="w-full h-full object-cover mix-blend-luminosity"
        />
      </div>
      <CardContent className="flex-grow p-4">
        <h3
          className="text-xl cursor-pointer underline font-bold mb-2"
          onClick={() => {
            setTopic(topic.topic);
          }}
        >
          {topic.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{topic.description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const TopicSelection = ({
  setTopic,
}: {
  setTopic: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const settings = {
    arrows: false,
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4.5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3.5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2.2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "40px",
        },
      },
    ],
  };

  return (
    <div className="container w-full px-0 mb-3">
      <h2 className="text-xl font-bold px-0 mb-6 text-center md:text-left">
        Pick a topic or add your own
      </h2>
      <Slider {...settings}>
        {topics.map((topic) => (
          <TopicCard key={topic.title} topic={topic} setTopic={setTopic} />
        ))}
      </Slider>
    </div>
  );
};

export default TopicSelection;
