---
title: "How Access Control Lists (ACLs) work and how to use them"
date: 2021-09-20T12:58:57+02:00
draft: false
menu: favorites
description: ACLs can solve complex permission requirements. This guide will explain how they work and how to use them.
---

{{< toc >}}

I often use ACLs when I have to give permissions to specific users or groups without compromising security. But I never fully understood how they work, as they are pretty complex. This guide will explain how they work and how to use them.

## Requirements

I assume experience with Linux and the command line.

ACLs must be supported and enabled by the filesystem (mounted with the `acl` option). As `systemd` depends on the `acl` package and the most common filesystems have ACLs enabled by default, any modern Linux distribution should work.

If you are unsure if ACLs are enabled, you can check this with the following command:

```bash
tune2fs -l /dev/sdXY | grep "Default mount options:"
```

If enabled, the output should look something like this:

```bash
Default mount options:    user_xattr acl
```

To set `acl` as a default mount option for a filesystem, use the `tune2fs` utility:

```bash
tune2fs -o acl /dev/sdXY
```

## What exactly are ACLs

Access Control Lists allow for more fine-grained and flexible permissions for files and directories. Based on the draft for POSIX 1003.1e, ACLs are a superset of standard Linux permissions.

They are handy if you have complex permission requirements. For example, you got a docroot of your Web application owned by the `www-data` user and the `developer` group. The new product owner needs read access to the log files of the application. Now what? She does not have the same UID as the `www-data` user, and adding her to the `developer` group would be too permissive.

This situation can be tricky as standard Linux permissions only allow one user and one group. Sure, you could make everything read-only to everyone, but that would be a bad idea. You can solve this situation with ACLs by adding a new user with read-only permissions to the docroot.

The situation above is just a simple example, and there are way more complex scenarios that ACLs can solve.

Even though the draft never made it to an official release, most Unix-like systems implemented Access Control Lists.

## Recap the Basics

Before we dive in, let's quickly recap how basic permissions on Linux work. Linux gives us three entities for which we can manage permissions separately:

- **U**ser (owner)
- **G**roup (owner group)
- **O**ther (everyone else)

For each entity, we can set three permissions (there are more, but for the sake of simplicity, we will ignore them for now):

- **R**ead (octal 4)
- **W**rite (octal 2)
- e**X**ecute (octal 1)

For example:

```plain
drwxr-x--- 2 cassidy developer 4096 Sep 11 13:05 exampledir
```

Here we can see that the owner is the user `cassidy` and the owner group is `developer`. Cassidy can read and create files in the directory, whereas the group members can only read/list the directory's content. Everyone else has no access at all.

## Viewing current ACLs

After we reviewed how basic permissions work, let's look at identifying files with Access Control Lists. Luckily `ls` knows about ACLs and indicates what files have ACLs by appending a `+` to the permissions:

```plain
drwxr-x---+ 2 cassidy developer 4096 Sep 11 13:05 exampledir
```

Now that we know that this file has ACLs let's display all ACLs by using the `getfacl` command:

```plain
[root@lab docroot]# getfacl exampledir
# file: exampledir
# owner: cassidy
# group: developer
user::rwx
user:finley:rwx            #effective:r-x
group::r-x
mask::r-x
other::---
default:user::rwx
default:user:finley:rwx    #effective:r-x
default:group::r-x
default:mask::r-x
default:other::---
```

That's a lot to digest. Let's break it down.

## How ACLs work

The first three lines display the filename, the owner, and the owner group:

```plain
# file: exampledir
# owner: cassidy
# group: developer
```

The next block specifies individual user permissions. This example shows that the user `finley` has read and execution rights for this directory. The first line without a user name, `user::rwx`, equals to the permission of the owner (Cassidy):

```plain
user::rwx
user:finley:rwx
```

The third block contains group permissions. In this case, there are only the permissions of the owner group, but there could be a named entry like `group:management:r-x`, which would allow the `management` group to access the contents of this directory:

```plain
group::r-x
```

Next, we have the mask block. Masks can be challenging, and we will cover them later in detail. For now, keep in mind that masks limit access rights, and the comments like `#effective:r-x` display the actual permissions.

```plain
mask::r-x
```

Next up is the `other` block. It works like the previous blocks and specifies the permissions for everyone else:

```plain
other::---
```

Lastly, we have the `default` block. This block exists only on directories and includes all other blocks mentioned before. Here we can specify what permission should apply to new files within a directory.

```plain
default:user::rwx
default:user:finley:rwx    #effective:r-x
default:group::r-x
default:mask::r-x
default:other::---
```

ACLs with only the three base entries `user::`, `group::` and `other::` are called minimal ACLs. ACLs containing named entries are called extended ACLs.

### Masks and effective rights explained

After looking at the output, let's address probably the most confusing aspect about Access Control Lists: Masks and effective rights.

Standard permissions can't reflect complex ACLs. Therefore the working group agreed on a complex masking mechanism to preserve maximum compatibility between basic permissions and ACLs.

To better understand masks, let's start with five simple statements that always will be true:

1. If the ACL has no mask entry, the permissions of the owner group will correspond to the ACL group.
2. If the ACL has named users or groups, it will have a mask entry.
3. If the ACL has a mask entry, the permissions of the owner group will correspond to the mask entry.
4. Unless otherwise stated, the mask entry's permissions will be the union of all permissions affected by an ACL and recalculate on every change.
5. Masks denote maximum access rights that can be granted by a named user entry, named group entry, or the `group::` entry.

The first statement is pretty self-explanatory. As long as there is no mask, the permissions of the owner group and the `group::` entry will be the same. Changes to the owner group will be reflected in the `group::` entry and the other way around.

The next one states that as soon as you add named user or group entries, `setfacl` will automatically add a mask entry if it does not exist.

The third statement is where it gets interesting. If a mask exists, the meaning of the owner group will change. The owner group will equal the mask entry. Changes with `chmod` to the owner group will change the mask entry. Changes via `setfacl` to the mask entry will change the owner group's permissions.

But how can we manage the permissions of the owner group without changing the mask? Don't worry. You can change permissions for the owner group via the `group::` entry.

Thanks to the fourth statement, we know that the mask's permissions can change and always equal the union of named users, named groups, and the `group::` entry.

To prevent the mask from recalculating on change, use `-n` option.

The last statement lets us know, and this is important, that you can't grant more permissions than specified in the mask for named users, named groups, and `group::` entries. This restriction is what causes the so-called effective rights.

For example, if we add the following ACL and mask:

```plain
user:finley:rwx
mask::r-x
```

The user `finley` only has the rights `rx`, as `w` is not allowed by the mask.

Like every other entry, we can change the mask explicitly:

```plain
setfacl -m m:rw
```

Unless you use `-n` to prevent the mask from recalculating, all following changes will overwrite your mask again.

### Precedence of ACLs

One last thing to understand is the following order in which the algorithm checks for permission:

1. File owner.
2. Named user entries.
3. Owner group (or `group::` entry).
4. Named group entries
5. Other

The first match determines the access to the resource. The order is essential, as it will deny writing access if a named user entry with `r` exists even when the user is a member of matching group entry with correct permissions:

```plain
[root@lab docroot]# getfacl exampledir
# file: exampledir
# owner: cassidy
# group: developer
user::rwx
user:finley:r-x
group::rwx
mask::rwx
other::r-x

[finley@lab docroot]$ groups
finley developer

[finley@lab docroot]$ touch exampledir/testfile
touch: cannot touch 'exampledir/testfile': Permission denied
```

## Working with ACL entries

At this point, we should have a good understanding of how Access Control Lists work. Finally, let's modify ACLs. Fortunately, this is pretty straightforward. To set or remove ACLS, use the `setfacl` command. The syntax is always:

```plain
setfacl [option] [action/specification] file
```

A colon separates the specification into three sections: object type, associated object, and permissions. Here is a list of all object types:

| Name | Type | Text form |
| --- | --- | --- |
| Owner | `ACL_USER_OBJ` | `u::rwx` |
| Named user | `ACL_USER` | `u:name:rwx` |
| Owner group | `ACL_GROUP_OBJ` | `g::rwx` |
| Named group | `ACL_GROUP` | `g:name:rwx` |
| Mask | `ACL_MASK` | `m::rwx` |
| Others | `ACL_OTHER` | `o::rwx` |

The following example indicates that we want to modify the permissions for the user `finley`. It is possible to use UIDs and specify permissions as octal numbers or characters:

```plain
u:finley:6
u:33:rw
```

You can modify multiple entries simultaneously by separating specifications with a comma:

```plain
u:finley:rwx,g:accounting:rx
```

If you use `setfacl` on a file system that does not support ACLs, `setfacl` tries to reflect the desired permissions via the standard permissions and output an error. Be aware that this could lead to unexpected results.

Here are some common options for `setfacl`, but I will explain them in detail in the following sections.

{{% tip %}}If you are unsure if your ACL results in the expected outcome, you can use the `--test` option to display the new ACL entries without changing the current ones.{{% /tip %}}

| OPTION | DESCRIPTION |
| --- | --- |
| `-m` | Modify or add an ACL entry (always needs to be the last option). |
| `-d` | Sets ACL entry as default (Only works on directories). |
| `-R` | Recursively applies changes. |
| `-x` | Removes specified entry. |
| `-k` | Removes all default entries. |
| `-b` | Removes all entries. |
| `-n` | Prevents the mask from being recalculated. |

### How to create/modify ACL entries

To create or modify ACLs, use the modify option `-m` and follow it with your specification explained above. If the same object exists, the new entry will overwrite existing permissions. For example, to add or change the permissions for the user `finley` to `rwx`, execute the following:

```plain
setfacl -m u:finely:rwx exampledir
```

It is crucial that after the option `-m`, the specification follows immediately. So if you want to change the permissions recursively, you have to write `-Rm`.

`-mR` will result in an error!

{{% tip %}}If you want to apply read-only permissions for files and directories recursively, you can use `rX`. A capital `X` only applies execution rights to directories. So all files would get `r` permissions, and all directories would become `rx` permissions.{{% /tip %}}

### Creating default permissions for new files

If you want newly created files to get specific permissions automatically, you can specify default permissions on the parent directory:

```plain
setfacl -dm u:finely:rwx exampledir
```

This only works for directories (`-Rdm` ignores files). All new files and directories in `exampledir` will inherit these permissions (new directories will also inherit the default entries). Unfortunately, this applies only to newly created files, not copied ones.

### Removing ACL entries

To remove single entries, use the `-x` option instead of `-m`:

```plain
setfacl -x g:accounting exampledir
```

Like with the `-m` option, you can use the `-d` switch to remove single default entries: `-dx`.

To remove all default entries, use the `-k` option:

```plain
setfacl -k exampledir
```

If you want to remove all ACL entries, you can nuke them with the `-b` option, but be careful when to use it!

```plain
setfacl -b exampledir
```

Furthermore, be aware that unless you use the `-n` switch, the mask will recalculate when removing entries. So check for possible breaking changes!

## Conclusion

You have now learned how Linux Access Control Lists work and how to use them. I hope it helps to solve complex permission structures more confidently.

If you want to read more about ACLs, I recommend the article from Andreas Grünbacher, one of the draft's authors for POSIX ACLs. Not to mention the man pages for `acl`, `getfacl`, and `setfacl`:

- [POSIX Access Control Lists on Linux by Andreas Grünbacher](https://www.usenix.org/legacy/publications/library/proceedings/usenix03/tech/freenix03/full_papers/gruenbacher/gruenbacher_html/main.html)
- [acl - Linux man page](https://linux.die.net/man/5/acl)
- [getfacl - Linux man page](https://linux.die.net/man/1/getfacl)
- [setfacl - Linux man page](https://linux.die.net/man/1/setfacl)

If you found any mistakes or want to say hi, send me a message.

{{% plug %}}
