
--
-- Tabel structuur voor tabel `su_announcements`
--

DROP TABLE IF EXISTS `su_announcements`;
CREATE TABLE IF NOT EXISTS `su_announcements` (
  `id` int(11) NOT NULL default '0',
  `user_id` int(11) NOT NULL default '0',
  `due_time` int(11) NOT NULL default '0',
  `ctime` int(11) NOT NULL default '0',
  `mtime` int(11) NOT NULL default '0',
  `title` varchar(50) default NULL,
  `content` text,
  PRIMARY KEY  (`id`),
  KEY `due_time` (`due_time`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabel structuur voor tabel `su_notes`
--

DROP TABLE IF EXISTS `su_notes`;
CREATE TABLE IF NOT EXISTS `su_notes` (
  `user_id` int(11) NOT NULL,
  `text` text,
  PRIMARY KEY  (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabel structuur voor tabel `su_rss_feeds`
--

DROP TABLE IF EXISTS `su_rss_feeds`;
CREATE TABLE IF NOT EXISTS `su_rss_feeds` (
  `user_id` int(11) NOT NULL,
  `url` varchar(255) default NULL,
  PRIMARY KEY  (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
