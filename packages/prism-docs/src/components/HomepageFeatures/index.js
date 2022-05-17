import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

const FeatureList = [
  {
    title: 'Customizable Experience',
    description: (
      <>
        Through the use of our configuration API, custom style options, and use of Tailwind CSS, PRISM has the ability to be customized to fit your application's experience.
      </>
    ),
  },
  {
    title: 'Advanced Color Tools',
      description: (
      <>
        From color walls to automatic room tinting, PRISM's color tools make it fast and easy to add simple or complex color features to your application.
      </>
    ),
  },
  {
    title: 'Flexible Installation Options',
      description: (
      <>
      While PRISM is written in React and exports React components, that doesn't mean your application needs to be in React! There are multiple methods in which PRISM is able to be integrated into your application. <Link to="getting-started">Learn more here!</Link>
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--left padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
