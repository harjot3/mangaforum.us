/** Only link to the publishers supported by this catalog; reject active URL schemes. */
export function publisherUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return undefined;
    if (
      !["viz.com", "www.viz.com", "kodansha.us", "www.kodansha.us"].includes(
        url.hostname,
      )
    )
      return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
