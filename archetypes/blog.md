---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
slug: "{{ .Name }}"
draft: true
page_id: "{{ substr (sha256 (print .File.Path (now.UnixNano))) 0 10 }}"
author: "Chris Feichtner"
categories: []
tags: []
description: ""
cover:
  image: ""
  alt: ""
---
