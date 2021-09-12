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

```plain
drwxr-xr-x 2 cassidy developer 4096 Sep 11 13:05 exampledir
```

Here we can see tha ther owner is the user `cassidy` and the owner group is `developer`. Cassidy will be able to read and create file in the directory, whereas the members of the group and everyone else only can read/list the content of the directory.

## Viewing current ACLs

Now that we reviewed how basic permissions work, lets have a look we can work with Acess Controll Lists.

First, hoe can we identify files that have ACLs? Luckily `ls` knows about ACLs and indicated what files ave ACLs by appending a `+` to the permissions:

```plain
drwxr-xr-x+ 2 cassidy developer 4096 Sep 11 13:05 exampledir
```

Now that we know that this file has ACLs, lets display all ACLs for this file. For this we can use the `getfacl` command:

```plain
[root@lab docroot]# getfacl exampledir
# file: exampledir
# owner: cassidy
# group: developer
user::rwx
user:finley:r-x
group::r-x
mask::r-x
other::r-x
default:user::rwx
default:user:finley:r-x
default:group::r-x
default:mask::r-x
default:other::r-
```

Woah hey that a lot to digest, let's break it down.

## How ACLs work

As mentioned above ACLs are a superset of basic Linux permissions so they are mirrored in the output of `getfalc`.

The first block, the first three lines, display the filename, the owner and the owner group:

```plain
# file: exampledir
# owner: cassidy
# group: developer
```

The next block spevidy individual user rights. In this example we can see the user `finley` has read and access rights for this directory. The first line without a user name, `user::rwx`, mirrors the permissions fo the owner, in thi case `cassidy:

```plain
user::rwx
user:finley:r-x
```

In the third block come the group permissions. in this case there is only the permissions of the owner gorup, but there could be a line like `group:management:r-x` which would allow the `management` group to access the contents of this driectory:

```plain
group::r-x
```

Next we have the mask Block. Masks are a bit triyk to understand and we will cover the later in detail. For now jus know that Masks are used to limit access right

```plain
mask::r-x
```

Next up there is the other block. It works like all other block and specify the permissoins for everyone else:

```plain
other::r-x
```

Lastly, we have the defaults block. This block exists only on directories and inlcued all other blocks mentiond before. Here wen can specify defaults for the different enteties like users, groups, masks, etc:

```plains
default:user::rwx
default:user:finley:r-x
default:group::r-x
default:mask::r-x
default:other::r-
```

### Precedens of ACLs

### Default ACLs

### Masks explained

## Create and Remove ACLs
