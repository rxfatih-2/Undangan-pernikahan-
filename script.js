/* ============================================
   UNDANGAN PERNIKAHAN ADAT JAWA
   File: script.js
   Deskripsi: Semua interaksi & animasi
   ============================================ */

(function() {
  'use strict';

  /* ============================================
     1. KONTROL MUSIK (GONG)
     ============================================ */
  function initMusik() {
    const btnMusik = document.getElementById('toggleMusik');
    const backsound = document.getElementById('backsound');

    if (!btnMusik || !backsound) return;

    btnMusik.addEventListener('click', () => {
      if (backsound.paused) {
        backsound.play().then(() => {
          btnMusik.classList.add('aktif');
        }).catch(() => {});
      } else {
        backsound.pause();
        btnMusik.classList.remove('aktif');
      }
    });

    document.addEventListener('click', function autoPlay() {
      if (backsound.paused) {
        backsound.play().then(() => {
          btnMusik.classList.add('aktif');
        }).catch(() => {});
      }
      document.removeEventListener('click', autoPlay);
    }, { once: true });

    backsound.addEventListener('play', () => btnMusik.classList.add('aktif'));
    backsound.addEventListener('pause', () => btnMusik.classList.remove('aktif'));
  }

  /* ============================================
     2. FORM UCAPAN & DOA
     ============================================ */
  function initFormUcapan() {
    const form = document.getElementById('formUcapan');
    const daftar = document.getElementById('daftarUcapan');
    
    if (!form || !daftar) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = document.getElementById('nama').value.trim();
      const pesan = document.getElementById('pesan').value.trim();
      const kehadiran = document.getElementById('kehadiran').value;

      if (!nama || !pesan) {
        tampilkanNotifikasi('Mohon lengkapi nama lan pesan!', 'warning');
        return;
      }

      const statusIcon = {
        'hadir': '✅ ',
        'tidak': '❌ ',
        'ragu': '❓ '
      }[kehadiran] || '';

      const item = document.createElement('div');
      item.className = 'ucapan-item';
      item.innerHTML = `
        <p class="ucapan-nama">${statusIcon}${escapeHtml(nama)}</p>
        <p class="ucapan-pesan">"${escapeHtml(pesan)}"</p>
      `;

      daftar.insertBefore(item, daftar.firstChild);

      item.style.opacity = '0';
      item.style.transform = 'translateY(-20px)';
      requestAnimationFrame(() => {
        item.style.transition = 'all 0.6s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });

      form.reset();
      tampilkanNotifikasi('Matur nuwun! Ucapan panjenengan sampun kacathet. 🙏', 'success');
    });
  }

  /* ============================================
     3. SALIN REKENING
     ============================================ */
  function initSalinRekening() {
    document.querySelectorAll('.tombol-salin').forEach(btn => {
      btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const nomor = this.getAttribute('data-nomor');
        
        if (!nomor) return;

        navigator.clipboard.writeText(nomor).then(() => {
          const el = document.getElementById(targetId);
          if (!el) return;

          const original = el.textContent;
          el.textContent = '✓ Kacathet!';
          el.style.color = '#8B6914';
          el.style.background = 'rgba(201,162,39,0.25)';

          tampilkanNotifikasi('Nomor rekening sampun kasalin! 📋', 'success');

          setTimeout(() => {
            el.textContent = original;
            el.style.color = '';
            el.style.background = '';
          }, 1800);
        }).catch(() => {
          const temp = document.createElement('textarea');
          temp.value = nomor;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
          tampilkanNotifikasi('Nomor rekening sampun kasalin! 📋', 'success');
        });
      });
    });
  }

  /* ============================================
     4. SCROLL REVEAL
     ============================================ */
  function initScrollReveal() {
    const elemen = document.querySelectorAll(
      '.kartu-pengantin, .kartu-momen, .frame-foto, .frame-video, ' +
      '.kartu-acara, .kartu-hadiah, .form-rsvp, .kutipan-box, .daftar-ucapan, ' +
      '.alamat-kado, .panutup-box, .countdown-box'
    );

    if (!elemen.length) return;

    if (!('IntersectionObserver' in window)) {
      elemen.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    elemen.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(el);
    });
  }

  /* ============================================
     5. COUNTDOWN
     ============================================ */
  function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    // GANTI TANGGAL INI sesuai tanggal pernikahan Anda
    const tanggalNikah = new Date('2026-10-15T08:00:00').getTime();

    const hari = document.getElementById('cd-hari');
    const jam = document.getElementById('cd-jam');
    const menit = document.getElementById('cd-menit');
    const detik = document.getElementById('cd-detik');

    let interval;

    function update() {
      const now = new Date().getTime();
      const selisih = tanggalNikah - now;

      if (selisih < 0) {
        countdownEl.innerHTML = '<p class="cd-selesai">ꦄꦕꦫꦫꦩ꧀ꦥꦸꦁꦔꦤ꧀<br><em>Acara telah berlangsung</em></p>';
        if (interval) clearInterval(interval);
        return;
      }

      const d = Math.floor(selisih / (1000 * 60 * 60 * 24));
      const h = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((selisih % (1000 * 60)) / 1000);

      if (hari) hari.textContent = String(d).padStart(2, '0');
      if (jam) jam.textContent = String(h).padStart(2, '0');
      if (menit) menit.textContent = String(m).padStart(2, '0');
      if (detik) detik.textContent = String(s).padStart(2, '0');
    }

    update();
    interval = setInterval(update, 1000);
  }

  /* ============================================
     6. TOMBOL KE ATAS
     ============================================ */
  function initTombolKeAtas() {
    const btn = document.getElementById('keAtas');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.add('tampil');
      } else {
        btn.classList.remove('tampil');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================
     7. SHARE WHATSAPP
     ============================================ */
  function initShareWA() {
    const btn = document.getElementById('shareWA');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const pesan = encodeURIComponent(
        'Sugeng rawuh! Kami ngundang panjenengan dhumateng mantenan:\n\n' +
        '💍 Andi & Sarah\n' +
        '📅 Senin Pahing, 15 Oktober 2026\n' +
        '📍 Gedung Graha Wisata, Surabaya\n\n' +
        'Serat ulem lengkap: ' + window.location.href
      );
      
      window.open('https://wa.me/?text=' + pesan, '_blank');
    });
  }

  /* ============================================
     8. BUKA UNDANGAN
     ============================================ */
  function initBukaUndangan() {
    const btn = document.getElementById('bukaUndangan');
    const overlay = document.getElementById('overlayPembuka');
    const backsound = document.getElementById('backsound');
    const btnMusik = document.getElementById('toggleMusik');

    if (!btn || !overlay) return;

    // Lock scroll awal
    document.body.style.overflow = 'hidden';

    btn.addEventListener('click', () => {
      overlay.classList.add('terbuka');
      
      if (backsound) {
        backsound.play().then(() => {
          if (btnMusik) btnMusik.classList.add('aktif');
        }).catch(() => {});
      }

      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
      }, 800);
    });
  }

  /* ============================================
     9. SMOOTH SCROLL
     ============================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ============================================
     10. ANIMASI ANGKA
     ============================================ */
  function initAnimasiAngka() {
    const angkaElemen = document.querySelectorAll('[data-count]');
    if (!angkaElemen.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          let current = 0;
          const step = Math.max(1, Math.floor(target / 50));
          
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              el.textContent = target;
              clearInterval(timer);
            } else {
              el.textContent = current;
            }
          }, 30);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    angkaElemen.forEach(el => observer.observe(el));
  }

  /* ============================================
     UTILITIES
     ============================================ */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function tampilkanNotifikasi(pesan, tipe = 'info') {
    const old = document.querySelector('.notif-toast');
    if (old) old.remove();

    const notif = document.createElement('div');
    notif.className = 'notif-toast notif-' + tipe;
    notif.textContent = pesan;
    document.body.appendChild(notif);

    requestAnimationFrame(() => {
      notif.style.opacity = '1';
      notif.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      notif.style.opacity = '0';
      notif.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => notif.remove(), 400);
    }, 3000);
  }

  /* ============================================
     INISIALISASI SEMUA
     ============================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initMusik();
    initFormUcapan();
    initSalinRekening();
    initScrollReveal();
    initCountdown();
    initTombolKeAtas();
    initShareWA();
    initBukaUndangan();
    initSmoothScroll();
    initAnimasiAngka();
    
    console.log('✅ Undangan Pernikahan Adat Jawa siap!');
  });

})();
