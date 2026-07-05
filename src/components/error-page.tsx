"use client";

import Image from "next/image";
import Link from "next/link";
import { NotFoundEffect } from "@/components/notfound-effect";
import { r2Asset } from "@/data/assets";

const NOTFOUND_IMAGE = r2Asset("mimeyoi/wp/wp-content/uploads/2026/02/404_v4.jpg");

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
          <span>EXPLORE</span>
        </Link>
      </div>
    </main>
  );
}
