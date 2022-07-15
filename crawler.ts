class Crawler {}

export async function newCrawler (): Promise<Crawler> {
  return new Crawler()
}
