package us.mangaforum.chapters;

import java.net.URI;
import java.util.Set;

public final class PublisherLinks {
    private static final Set<String> HOSTS = Set.of("viz.com", "www.viz.com", "kodansha.us", "www.kodansha.us", "kmanga.kodansha.com", "mangaplus.shueisha.co.jp", "www.shonenjump.com", "younganimal.com", "magazine.younganimal.com", "digital.darkhorse.com", "www.darkhorse.com", "www.darkhorsedirect.com", "sevenseasentertainment.com", "yenpress.com", "www.square-enix-mangaandbooks.com", "square-enix-mangaandbooks.com", "comic-gardo.com", "comicride.jp", "shonenjumpplus.com", "tonarinoyj.jp", "shonenmagazine.com", "pocket.shonenmagazine.com", "comic-days.com", "kuragebunch.com", "www.sunday-webry.com", "sunday-webry.com", "www.manga-up.com", "manga-up.com", "mangacross.jp", "championcross.jp", "comic-walker.com");
    public static String safe(String value) {
        if (value == null) return null;
        try {
            var url = URI.create(value);
            return "https".equals(url.getScheme()) && url.getUserInfo() == null && url.getPort() == -1 && HOSTS.contains(url.getHost()) && value.length() <= 500 ? value : null;
        } catch (IllegalArgumentException e) { return null; }
    }
    private PublisherLinks() {}
}
