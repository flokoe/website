---
title: "Mastering Linux Access Lists (ACLs) once and for all + cheat sheet"
date: 2021-09-03T19:24:43+02:00
draft: true
wip: true
menu: favorites
---

Once in a while I have to give some users or groups permissions to specific files or directories without giving them access to other thisgs. Often I used Acls but to be hones i never fully understood how they wok. This artike should gui you through
teh difficulties using ACLS and explain how they work and  how to use them.

## Requirements

I assume basic experience on the commands line and Linux.

ACLs must be supported and enabled(mounted with acl) by the filesystem. As `acl` package is a dependency of systemd and BtrFS, ext, ext3 and ext4 have acls enabled by dfault most modern Linux Distributions should work.

If you are unsure if acls are enbaled, you can check this with the following command

```bash
tune2fs -l /dev/sdXY | grep "Default mount options:"
```

If enabled the output should look something like this

```bash
Default mount options:    user_xattr acl
```

To set the default mount options for a filesystem use the `tune2fs` utility:

```bash
tune2fs -o acl /dev/sdXY
```

## Waht exactly are ACLs

Access Controll Lists (ACLs) allow for more fine-grained and flexible permissions for files and directories.

Based on a draft for POSIX 1003.1e ACLs are kind of a Superset of standard linux permissions and should extend them without braking them.

They are especially useful if you have complex permission requqirements. For example, you got a docroot of your Webapplication which is owned by `www-data` user (User of the webserver) and belongs to the group `developer`. Both have write access. No some Product owner needs read acces to log file of the appplication. Now what? They dont have the same `uid` as the `www-data` user and adding them to the `developer` groups sound like a bad Idea too.

This situation can be tricky as standard linux permissions only allow one user and one group, sure, you could make everythin read only to everyone but that would be a bad idea. With ACLs you can solve this situation and add the specificy suer with read only permissions to the docroot.

This is just a simple example, there are way more complex szenarios which can be solved by ACLs.

Even thou the draft never made it to an official release most Unixes implemented Access Controll Lists.

## Recap the Basics

Before we dive in lets quickly recap how basic permissions on Linux work. Linux gives us three entities for which we can manage permisions separately:

- **U**ser (owner)
- **G**roup (owner group)
- **O**ther (everyone else)

For each Entity we can set three permissions (there are more, but for sake of simplicity we will ignore them for now):

- **R**ead (octal 4)
- **W**rite (octal 2)
- e**X**ecute (octal 1)

For example:

```bash
-rw-r--r-- 1 cassidy users 12 Sep 11 13:05 examplefile
```

Here we can see tha ther owner is the user `cassidy` and the owner group is `users`. Cassidy will be able to read and write t the file, whereas the group and everyone else only can read the content if the file. Furthermore this file is not executable.

## Viewing current ACLs
