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

I assume basic experience on the commands line.

ACLs must be supported and enabled(mounted with acl) by the filesystem. As acl are a dependency of systemd and BtrFS, ext, ext3 and ext4 have acls enabled by dfault most modern Linux Distributions should work.

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
tune2fs .o acl /dev/sdXY
```
