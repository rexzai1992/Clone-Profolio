"use client";

import Image from "next/image";
import Link from "next/link";
import { NotFoundEffect } from "@/components/notfound-effect";
const NOTFOUND_IMAGE = "/images/kaynx1-hero-anime.png";

export function ErrorPage() {
  return (
    <main className="error-page">
      <h1 className="error-page__title">
        404 <br className="error-page__break" />
        ERROR
      </h1>
      <div className="error-page__image" aria-hidden="true">
        <Image src={NOTFOUND_IMAGE} alt="" fill sizes="100vw" priority />
        <NotFoundEffect src={NOTFOUND_IMAGE} />
      </div>
      <div className="error-page__link">
        <Link className="c-button" href="/">
          <span>BACK TO KAYNX1</span>
        </Link>
      </div>
    </main>
  );
}
