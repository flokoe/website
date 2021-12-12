---
title: "Fix Slow MariaDB Replication Lag"
date: 2021-09-28T21:23:42+02:00
draft: false
description: How to enable parallel replication for MariaDB to prevent replication lag.
---

If you have experienced significant replication lags and replication so slow that it needed hours to complete or couldn't catch up at all, I may have a solution for you.

A couple of weeks ago, I set up a MariaDB replication from scratch for a production database. The dBuy me a beeratabase has a considerable size and is under heavy use.

As usual, I used [Mariabackup](https://mariadb.com/kb/en/mariabackup/) to copy the entire data directory of MariaDB to the new replica server. Unfortunately, I had to interrupt my work and wasn't able to continue until 12 hours later. As I resumed where I left off, I noticed that the database grew substantially. Since I didn't want to resync about 200 GB of data, I left the rest to the replication.

Well, It did not go as planned. The replication was so slow that it couldn't catch up.

The server had enough resources to handle the amount of data, so why was it so slow? After some research, I found that while **MariaDB fully benefits from multiple CPU cores, the replication process does not!**

The replication process only runs on one core and processes events in serial. Luckily, you can fix this by increasing [slave_parallel_threads](https://mariadb.com/kb/en/replication-and-binary-log-system-variables/#slave_parallel_threads).

On your replica server, set the value to the number of CPU cores you can spare. You can change this parameter without restarting the database, but to do this, you first have to stop the replication:

```sql
STOP SLAVE SQL_THREAD;
SET GLOBAL slave_parallel_threads = 4;
START SLAVE SQL_THREAD;
SHOW GLOBAL VARIABLES LIKE 'slave_parallel_threads';
```

Now your replica server will execute events in parallel (shortened view):

```plain
MariaDB [mysql]> SHOW PROCESSLIST;
+--------------+-----------------------------------------------------------------------------+
| Command      | State                                                                       |
+--------------+-----------------------------------------------------------------------------+
| Slave_IO     | Waiting for master to send event                                            |
| Slave_worker | Waiting for work from SQL thread                                            |
| Slave_worker | Waiting for prior transaction to commit                                     |
| Slave_worker | Closing tables                                                              |
| Slave_worker | Waiting for work from SQL thread                                            |
| Slave_SQL    | Slave has read all relay log; waiting for the slave I/O thread to update it |
+--------------+-----------------------------------------------------------------------------+
```

I hope this is helpful to anyone who has similar issues.

{{% plug %}}
