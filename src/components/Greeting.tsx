import React, { useMemo } from 'react';

interface GreetingProps {
  userName: string;
}

const getRandomGreeting = (userName: string): string => {
  const greetings = [
    `Hola ${userName}! 👋`,
    `'Sup ${userName}? 🤙`,
    `Howdy ${userName}! 🤠`,
    `Oi ${userName}! 🎉`,
    `Ayy ${userName}! ✨`,
    `Yo ${userName}! 🚀`,
    `Greetings, earthling ${userName} 👽`,
    `Well well well, look who it is... ${userName} 😏`,
    `${userName} has entered the chat 💬`,
    `Beep boop! ${userName} detected 🤖`,
    `*tips hat* ${userName} 🎩`,
    `Oh hi ${userName}, didn't see you there 👀`,
    `Welcome back, legend ${userName} 🏆`,
    `${userName}! Long time no see (5 seconds) ⏰`,
    `Another day, another ${userName} 😎`,
    `Bonjour ${userName}! 🥐`,
    `Ahoy ${userName}! ⚓`,
    `What's good ${userName}? 🌟`,
    `Wassup ${userName}? 🎪`,
    `Hey hey ${userName}! 🎨`,
    `Namaste ${userName} 🙏`,
    `Salutations ${userName}! 📚`,
    `${userName} is in the house! 🏠`,
    `Ready to conquer Tuesday, ${userName}? 💪`,
    `Let's get this bread, ${userName}! 🍞`,
  ];

  const timeOfDay = new Date().getHours();
  
  // Add time-based greetings
  if (timeOfDay >= 5 && timeOfDay < 12) {
    greetings.push(
      `Good morning ${userName}! ☀️`,
      `Rise and shine ${userName}! 🌅`,
      `Wakey wakey ${userName}! ☕`
    );
  } else if (timeOfDay >= 12 && timeOfDay < 17) {
    greetings.push(
      `Good afternoon ${userName}! 🌤️`,
      `Afternoon ${userName}! Hope you had lunch 🍕`
    );
  } else if (timeOfDay >= 17 && timeOfDay < 22) {
    greetings.push(
      `Good evening ${userName}! 🌆`,
      `Evening ${userName}! Almost done for the day? 🌙`
    );
  } else {
    greetings.push(
      `Burning the midnight oil, ${userName}? 🌙`,
      `Night owl ${userName}! 🦉`,
      `Still working ${userName}? Go to bed! 😴`
    );
  }

  return greetings[Math.floor(Math.random() * greetings.length)];
};

export const Greeting: React.FC<GreetingProps> = ({ userName }) => {
  // Generate greeting once on mount to avoid it changing on every render
  const greeting = useMemo(() => getRandomGreeting(userName), [userName]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <p className="text-lg font-medium text-gray-800">
          {greeting}
        </p>
      </div>
    </div>
  );
};
