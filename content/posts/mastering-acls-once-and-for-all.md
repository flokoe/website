---
title: "Mastering Linux Access Lists (ACLs) once and for all"
date: 2021-09-03T19:24:43+02:00
draft: true
wip: true
menu: favorites
---

Once in a while I have to give some users or groups permissions to specific files or directories without giving them access to other things. Often I used ACLs but to be honest I never fully understood how they wok, as they are fairly complex topic. This article should guide you through
the difficulties using ACLs and explain how they work and how to use them.

## Requirements

I assume basic experience on the commands line and Linux.

ACLs must be supported and enabled by the filesystem (mounted with acl option). As the `acl` package is a dependency of systemd and BtrFS, ext2, ext3 and ext4 have ACLs enabled by default most modern Linux distributions should work.

If you are unsure if ACLs are enbaled, you can check this with the following command

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

## What exactly are ACLs

Access Controll Lists allow for more fine-grained and flexible permissions for files and directories.

Based on a draft for POSIX 1003.1e ACLs are kind of a superset of standard linux permissions and should extend them without breaking them.

They are especially useful if you have complex permission requirements. For example, you got a docroot of your Webapplication which is owned by `www-data` user (User of the webserver) and belongs to the group `developer`. Both have write access. The new product owner needs read acces to log file of the appplication. Now what? She does not have the same `uid` as the `www-data` user and adding her to the `developer` group would be too permissive.

This situation can be tricky as standard linux permissions only allow one user and one group, sure, you could make everythin read only to everyone but that would be a bad idea. With ACLs you can solve this situation and add the specificy user with read only permissions to the docroot.

This is just a simple example, there are way more complex scenarios which can be solved by ACLs.

Even though the draft never made it to an official release most Unixes implemented Access Controll Lists.

## Recap the Basics

Before we dive in let's quickly recap how basic permissions on Linux work. Linux gives us three entities for which we can manage permisions separately:

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

Here we can see that the owner is the user `cassidy` and the owner group is `developer`. Cassidy will be able to read and create files in the directory, whereas the members of the group and everyone else only can read/list the content of the directory.

## Viewing current ACLs

Now that we reviewed how basic permissions work, lets have a look how we can work with Acess Controll Lists.

First, how can we identify files that have ACLs? Luckily `ls` knows about ACLs and indicates what files have ACLs by appending a `+` to the permissions:

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

Woah hey that's a lot to digest, let's break it down.

## How ACLs work

<!-- mirrored might be unclear -->
As mentioned above ACLs are a superset of basic Linux permissions so they are mirrored in the output of `getfalc`.

The first three lines, display the filename, the owner and the owner group:

```plain
# file: exampledir
# owner: cassidy
# group: developer
```

The next block specifies individual user rights. In this example we can see the user `finley` has read and execute rights for this directory. The first line without a user name, `user::rwx`, equals to the permissions fo the owner, in this case `cassidy:

```plain
user::rwx
user:finley:r-x
```

In the third block comes the group permissions. in this case there is only the permissions of the owner group, but there could be a line like `group:management:r-x` which would allow the `management` group to access the contents of this driectory:

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

<!-- vllt etwas genauer, das e snur für neue files and rirectories gilt -->
Lastly, we have the defaults block. This block exists only on directories and inlcued all other blocks mentiond before. Here wen can specify defaults for the different enteties like users, groups, masks, etc:

```plain
default:user::rwx
default:user:finley:r-x
default:group::r-x
default:mask::r-x
default:other::r-
```

ACLs with only the three base entries `user::`, `group::` and `other::` are called minimal ACL. ACLs containing named entries are called extended ACLs.

### Understanding Masks and effective rights

After looking at hte output, lets address ptorbally the most ocnfusing thigs about Access Controll Lists: Masks and efekctive rights.

<!-- nicht deutlich genug, konkreter formulieren -->
To ensure that the standard permissions still work on systems with ACLs the working group agreed on a complex masking mechanism.

To remove some of the complexity lets start with five simple statements that always will be true:

1. If the ACL has no MASK entry the the ACL group will coressponent to the owner group.
2. If the ACL has named user or groups it will have a MASK entry.
3. If the ACL has a mask entry the permissions of the owner group will correspondent to the MASK entry.
4. UNless otherwise stated permission of the mask entry will be recalculated on every change and equal to the union of all permissions that are affected by an ACL.
5. Masks denote maximum access rights that can be granted by an named user entry, names group entry or the owner group.

Lets have a closer look at each statement.

Th first is pretty sefl explanatory. As long as there is no mask entry, the owner group permissions and the permissions for the `group::` entry will be the same. Changes to the owner group will be reflected in the `group::` entry and the other way around.

The next one states that as soon as you add named user or group entries setfacl will automatically add an mask entry if it ndoes not exist.

The third statement is where it gets interesting. If a mask entry exists the meaninf of the owner group will change. The woner group now equals to the mask entry. Chnages with `chmod` to the woner group will change the permission of th emask entry. Changes via stefalc to the mask entry changes the permissions of the owner group.

But how can we manage the permissions of the owner group without changing hte mask? Dont worry, you can chnage permissions for the owner group via the `group::` entry.

Thanks to the fourth satement we know the the permissions of the mask can chnage and always equals to the union of permissions from user, group etc.

To prevent the mask to recalculate on change use `-n` option.

The last statement lets us know, and this is important, that you cant grant more permissions than specified in the mask for users and group entries. This is what causes the so called effective rights.

For example if we add the following acl and mask:

```plain
user:finley:rwx
mask::rx
```

The user finley only has thr rights `rx`, as `w` is not allowed by the mask.

Like every other entry we can change the mask explicitly:

```plain
setfacl -m m:rw
```

BUt be aware unless you use the `-n` on the next change to prevent the mask to recalculate you mask will be overwritten.

### Precedens of ACLs

One last thing to understand is the order in which the permissions are checked. The following order is used and the first match determines the acces to the resource:

1. File owner.
2. Named user entries.
3. owner group.
4. Named group entries
5. other

Thi is important, as write access will be diend if a names user entry with `r` exixsts even when there is a mathing named group entry with correct permissions:

```plain
permissions denied
```

## Working with ACL entries

At this point we should have a good understanding of how Access Controll Lists work. Finally let's use modify ACLs. Fortunately this is pretty straight forward. To set or remove ACLS use `setfacl` command. The syntax is always

```plain
setfacl [option] [action/specification] file
```

The specification is separated by a colon in three sections: the object type, the associated object and its permission. For example:

```plain
u:finley:rwx
```

<!-- be more precise -->
Object type can be any entity you can mange with `chmod` plus te mask and is defined by the first character of ther name (**u**ser, **g**roup, **o**ther, **m**ask). In this case it indicated that we want to modify a user object. Following the type comes the name or ID of the object. At the end come the permissions, which can be specified as octal numbers or characters.

If there is no name in between the first and second color you will change the permissions for the base permissions (owner, owner gorup, other):

```plain
u::rwx
```

You can modify multiple entries simoulaniously by separteing specifactions with a comma:

```plain
u:finley:rwx,g:accounting:rx
```

If setfacl is used on a file system which does not support ACLs, setfacl will try to refelct the desired permsions via the basic permission and out put an error. Beaware that this could possible result in unexpected outcomes.

Here are some common options for `setfacl` but I will explain them in detail in the following sections.

{{% tip %}}If you are unsure if your ACL results in the expected outcome you can use the `--test` option to display the new ACL entries without changing the current entries.{{% /tip %}}

| OPTION | DESCRIPTION |
| --- | --- |
| `-m` | Modify or add an ACL entry (always needs to be the last option). |
| `-d` | Sets specified mask as default mask (Only works on directories). |
| `-R` | Recursively applies changes. |
| `-x` | Removes specified entry. |
| `-b` | Removes all entries. |
| `-n` | Prevents the mask from bein recalculated. |

### Creating/Modifiying entries

To create or modify ACLs use the modify option `-m` and followi it with your specifaction explained above. If the same object exists the permissions will be overwritten. For example to add or change the permissions for the user `finley` to `rwx` execute the following:

```plain
setfacl -m u:finely:rwx exampledir
```

It is import that after the option `-m` the specification follows immeadiately. So if you want to change the permissions recursevly you woul have to wirte `-Rm`.

`-mR` would result in an error!

{{% tip %}}If you want to apply read only permissions for files and directories recursively you can use `rX`. A capital `X`only applies execution rights to directories. So all files would get `r` permissions and all direcotires would become `rx` permissions.{{% /tip %}}

### Creating default permissions for new files

If you want that new created files automatically get certain permissions, you can specify default permissions on the parent directory:

```plain
setfacl -dm u:finely:rwx exampledir
```

This only works for diretories. All new files and directories in `exampledir` will inherit these permissions (new directories will inherit the default entries as well). Unfortunately thi shas no effects on files that are copied.

### Removing entries

To remove single entries use the `-x` option instead of `-m`:

```plain
setfacl -x g:accounting exampledir
```

Like with the `-m` option you can use the `-d` switch to remove single default entries: `-dx`.

To remove all default entries use the `-k` option:

```plain
setfacl -k exampledir
```

If you really want to remove all ACL entries you can nuke them with the `-b` optione, but be careful when to use it!

```plain
setfacl -b exampledir
```

Furthermore, be aware tha unless you use the `-n` switch the mask will still be recalculated (). So check for possible breaking changes!

## Conclusion

You have now learned how to Linux Access Controll Lists work and how to use them. I hope it helps to solve complex permission structure more confidently and prevent any data leaks.

If you want to read more about ACLs I recommend the article from Andreas Grünbacher, who was one of the authors of the draft for POSIX ACLs. Not to mention the man pages for `acl`, `getfacl` and `setfacl`:

- [POSIX Access Control Lists on Linux by Andreas Grünbacher](https://www.usenix.org/legacy/publications/library/proceedings/usenix03/tech/freenix03/full_papers/gruenbacher/gruenbacher_html/main.html)
- [acl - Linux man page](https://linux.die.net/man/5/acl)
- [getfacl - Linux man page](https://linux.die.net/man/1/getfacl)
- [setfacl - Linux man page](https://linux.die.net/man/1/setfacl)

If you found any mistakes or want to say hi, send me message.
