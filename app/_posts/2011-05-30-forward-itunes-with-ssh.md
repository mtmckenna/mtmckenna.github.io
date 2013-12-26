---
layout: post
title: Shell Script to Forward iTunes Library to Remote Machine via SSH
---

*Note: I originally posted this on [Forrst](http://forr.st/~D4u).*

I like to keep my music collection fairly centralized. Instead of having my music files spread out amongst various home and work computers, I have a machine at home host my iTunes/DAAP music library via [forked-daapd](https://github.com/jasonmc/forked-daapd) (although one could just as easily leave a computer running iTunes open).

This shell script, tested on OS X 10.6, connects to my home machine via SSH and forwards the DAAP port to my remote machine. There are a few [blog posts](http://blog.iharder.net/2009/09/28/itunes-stream-itunes-over-ssh/) out there that describe how to do this, but this is the script I eventually landed on. If you have any suggestions for improvements, please [let me know](mailto:matt@mtmckenna.com).

You'll need to be able to [log into your home machine via SSH](http://superuser.com/questions/104929/how-do-you-run-a-ssh-server-on-mac-os-x). To connect outside your own LAN, you'll also need to configure your router at home to forward the SSH port (default: 22) to whatever machine is hosting your iTunes library.

Here's the shell script:

{% highlight bash %}

    local_username="your_username"
    ssh_username="your_ssh_username"
    ssh_server="your_ssh_server.com"
    share_name="ssh iTunes"

    kill `ps -U "$local_username" | grep ssh | grep ":36890:127.0.0.1:3689 $ssh_username@$ssh_server" | awk '{ print $1 }'`
    kill `ps -U "$local_username" | grep dns-sd | grep "$share_name" | awk '{ print $1 }'`
    ssh -p 22 -fNL :36890:127.0.0.1:3689 "$ssh_username@$ssh_server"
    dns-sd -R "$share_name" _daap._tcp local 36890 &

{% endhighlight %}

