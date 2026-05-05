import React from 'react';

const SplitHeading: React.FC<{ text: string }> = ({ text }) => (
  <span className="split-heading">
    {text.split(' ').map((word, i) => (
      <span
        key={i}
        className="split-heading__word"
        style={{
          display: 'inline-block',
          marginRight: '0.25em',
        }}
      >
        {word}
      </span>
    ))}
  </span>
);

export default SplitHeading;
