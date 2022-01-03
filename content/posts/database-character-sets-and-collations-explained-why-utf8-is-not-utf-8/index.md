---
title: "Database character sets and collations explained – why utf8 is not UTF-8"
date: 2022-01-03T20:24:30+01:00
draft: true
description: This guide explains the difference between utf8 and utf8mb4 and why mixed collations are bad for performance
---

{{< toc >}}

The relationship between character sets and collations always seemed pretty vague to me, let alone the possible impact on performance. So if you are like me and want to know the difference between `utf8` and `utf8mb4` and why mixed collations are bad for your database performance, read on!

## Character sets and collations explained

Since computers only understand binary and humans don't, we use character sets to map binary to specific characters. The difficulty was that different nations used different symbols and sometimes mapped the same binary sequence to other characters. So based on the character set you used, the same data could mean different things.

Furthermore, depending on your language, you may sort certain characters differently than in other languages.

To quote the MariaDB documentation:

> A character set is a set of characters [and its mapping to binary] while a collation is the rules for comparing and sorting a particular character set.  
> – [MariaDB: Character Set and Collation Overview](https://mariadb.com/kb/en/character-set-and-collation-overview/)

For example, the first character of this article, `T` (LATIN CAPITAL LETTER T), in binary looks like `1010100`. The computer reads this binary sequence and knows that this is 84 in decimal. Now it looks up which character maps to this number. Using the UTF-8 character set, the number 84 equals `T`.

## Charater sets: The tale of □�💩

One of the most known character sets is ASCII (American Standard Code for Information Interchange). It only supports 128 different characters and is nowadays primarily used for art 😉

```plain
   |           |
       |      |  |
  | |   |       |
      ___     _%%%_
  \,-' '_|    \___/    hjm
  /""----'
```

A sperm whale and a bowl of petunias above the surface of an alien planet by Harry Mason (Hajoma).

Someone even recreated the [entire fourth episode of Star Wars in ASCII](https://www.asciimation.co.nz).

Even though 128 characters are enough to cover the English language and a few basic symbols, the limited range is unsuitable for international and modern communication. Therefore the UTF-8 standard was created, which is 100% backward compatible with ASCII but allows up to four bytes per character instead of just one.

Four bytes enable pretty much every character of every language, and that is why we can use all these funny emojis and don't see something like □�. Over time it became the de facto standard for everything.

## Why `utf8` in MySQL is not UTF-8

Of course, such an extensive and versatile character set is handy for a database that may store very different and complex data. That is why MySQL already implemented the standard for UTF-8 ([RFC 2279](https://www.ietf.org/rfc/rfc2279.txt)) in the [pre-pre-release of MySQL 4.1 on March 28, 2002](https://github.com/mysql/mysql-server/commit/55e0a9cb01af4b01bc4e4395de9e4dd2a1b0cf23). The old standard even allowed for six bytes per character.

For whatever reason, a few months later, in September 2002, a MySQL developer decided to push a one-byte commit [UTF8 now works with up to 3 byte sequences only](https://github.com/mysql/mysql-server/commit/43a506c0ced0e6ea101d3ab8b4b423ce3fa327d0) to the repository and change the allowed bytes from six to three.

Since then, the character set called `utf8` has been a crippled and proprietary variation as it neither conforms to the old nor the new definition ([RFC 3629](https://datatracker.ietf.org/doc/html/rfc3629)) of UTF-8. The misleading name still causes issues today.

> This is probably one of most expensive single char commits in world...  
> – morphles, Nov 25, 2021

Because the `utf8` character set only allows 3 bytes, you can't store some special characters in a database that utilizes this character set. Unfortunately, no one knows who made the change as all names were lost when moving the repository from BitKeeper to GitHub.

To remediate this mistake [MySQL added the `utf8mb4` charset in version 5.5.3](https://web.archive.org/web/20190201033750/https://dev.mysql.com/doc/relnotes/mysql/5.5/en/news-5-5-3.html). `utf8mb4` fully implements the current standard. Now `utf8` is an alias for `utf8mb3` and will be switched to `utf8mb4`.

## Collations: How to sort things

The order of numbers is pretty straightforward – four is lower and comes before the number five. Even the English alphabet is still pretty easy. But what about other languages with additional characters or completely different symbols? Which emoji comes first? 😃 (SMILING FACE WITH OPEN MOUTH) or 😋 (FACE SAVOURING DELICIOUS FOOD)?

Collations – sets of algorithms – determine how to sort certain characters. Which collation works best for you depends on your use case. But first, let's see how we can determine the difference between each collation.

To get a list of all collations your server supports, we can execute the following (shorted view):

```sql
MariaDB [(none)]> SHOW COLLATION;
+------------------------------+----------+------+---------+----------+---------+
| Collation                    | Charset  | Id   | Default | Compiled | Sortlen |
+------------------------------+----------+------+---------+----------+---------+
| utf8mb4_general_ci           | utf8mb4  |   45 | Yes     | Yes      |       1 |
| utf8mb4_bin                  | utf8mb4  |   46 |         | Yes      |       1 |
| utf8mb4_unicode_ci           | utf8mb4  |  224 |         | Yes      |       8 |
+------------------------------+----------+------+---------+----------+---------+
```

The collation name is separated into three parts. The first part is always the character set the collation belongs to. A collation can only be associated with one character set, but there can be multiple collations for a character set. The second part always describes the functionality of the collation. And the optional third part can be one or more additional feature flags.

Here is a list of common feature flags:

| Suffix | Meaning |
| -- | --- |
| `ci` | case-insensitive |
| `cs` | case-sensitive |

The middle part is the most interesting because it specifies the collation algorithm.

`bin` stands for `binary` and sorts data by its binary notation and does not consider any language-specific rules.

`general` honors some rules but uses a simplified algorithm favoring speed over accuracy.

`unicode` or its versioned variants like `unicode_520` use the official UCS (Universal Coded Character Set) algorithms. Unicode collations provide the most accurate sorting.

For example `utf8mb4_general_ci` does not knwo how to sort `s` and the German character `ß` ("sharp S") in contrast to `utf8mb4_unicode_520_ci` which sorts `ß` just fine (`ß` comes after `s`):

```sql
MariaDB [(none)]> SELECT 's' < 'ß' COLLATE utf8mb4_general_ci;
+---------------------------------------+
| 's' < 'ß' COLLATE utf8mb4_general_ci  |
+---------------------------------------+
|                                     0 |
+---------------------------------------+
1 row in set (0.000 sec)

MariaDB [(none)]> SELECT 's' > 'ß' COLLATE utf8mb4_general_ci;
+---------------------------------------+
| 's' > 'ß' COLLATE utf8mb4_general_ci  |
+---------------------------------------+
|                                     0 |
+---------------------------------------+
1 row in set (0.000 sec)

MariaDB [(none)]> SELECT 's' < 'ß' COLLATE utf8mb4_unicode_520_ci;
+-------------------------------------------+
| 's' < 'ß' COLLATE utf8mb4_unicode_520_ci  |
+-------------------------------------------+
|                                         1 |
+-------------------------------------------+
1 row in set (0.001 sec)

MariaDB [(none)]> SELECT 's' > 'ß' COLLATE utf8mb4_unicode_520_ci;
+-------------------------------------------+
| 's' > 'ß' COLLATE utf8mb4_unicode_520_ci  |
+-------------------------------------------+
|                                         0 |
+-------------------------------------------+
1 row in set (0.000 sec)
```

Unfortunately, `utf8mb4_unicode_ci` is based on UCS 4.0, which is very old. Even the newer `utf8mb4_unicode_520_ci` (UCS 5.2.0) is more than ten years old. But newer collations are already discussed, and we may see collations based on UCS 14 in version 10.8 of MariaDB. MySQL already implemented a few collations based on more recent UCS versions.

There are language-specific variants like `utf8mb4_german2_ci`, but I have never used them personally. I recommend sticking to the `unicode` versions as they fit most use cases.

## What about performance?

There are some considerations when choosing your collation. The most important one is always to use the same collation when comparing strings.

For example, when joining two tables with different sorting rulesets, MariaDB/MySQL cannot use indices and falls back scanning the entire tables.

Regarding the different collation algorithms: The `unicode` variants should be slower than the `general` variant due to the more complex algorithms, but this was years ago when computers were much weaker than now. With modern hardware, the speed gain should be hardly notable.

One last concern is the size stored on the disk because UTF-8 supports four bytes per character. But since UTF-8 is a variable-width character encoding, it only uses as many bytes as needed. For example, the first 128 characters like ASCII only use one byte.

## Conclusion

Now you know the difference between `utf8` and `utf8mb4` and what collation to use. There is no reason to use `utf8/utf8mb3`, and I believe everyone who chose `utf8` expected to get the real UTF-8 (`utf8mb4`), not a crippled version. So to use it, you have to specify `utf8mb4` explicitly.

Furthermore, we should prefer accuracy over speed. There is no need to use an old and quirky collation like `utf8mb4_general_ci` with modern hardware.

If you ask yourself how to convert your database stay tuned and follow me. I will cover this topic in my next post. Until then, have fun!

{{% plug %}}
