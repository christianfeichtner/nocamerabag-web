---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
page_id: "{{ substr (sha256 (print .File.Path (now.UnixNano))) 0 10 }}"
---

