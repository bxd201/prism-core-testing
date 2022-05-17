import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
          <img src="img/dct_logo.png" style={{ width: '200px', marginBottom: '1em' }}></img>
        <div className={styles.buttons}>
            <p>We exist to develop innovative ways to instill color confidence.
                The Digital Color Team combines emerging digital capabilities with the world-class expertise of Sherwin-Williams to make color decisions easier for our customers.
                Through a suite of custom Color Tools deployed from our own API platform, we empower the organization to create digital experiences that inspire projects, promote confidence, and remove barriers to purchase.
            </p>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Explore ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
