/* ============================================
   UNDANGAN PERNIKAHAN ADAT JAWA
   File: script.js
   Versi: 4.0 (Integrasi Video Cover & Modal Galeri)
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

    backsound.addEventListener('play', () => btnMusik.classList.add('aktif'));
    backsound.addEventListener('pause', () => btnMusik.classList.remove('aktif'));
  }

  /* ============================================
     2. BUKA UNDANGAN (Overlay Pembuka + Video Cover)
     ============================================ */
  function initBukaUndangan() {
    const btn = document.getElementById('bukaUndangan');
    const overlay = document.getElementById('overlayPembuka');
    const backsound = document.getElementById('backsound');
    const btnMusik = document.getElementById('toggleMusik');

    if (!overlay) {
      document.body.style.overflow = 'auto';
      return;
    }

    if (!btn) {
      setTimeout(() => {
        overlay.classList.add('terbuka');
        document.body.style.overflow = 'auto';
        setTimeout(() => { overlay.style.display = 'none'; }, 600);
      }, 1000);
      return;
    }

    // Kunci scroll saat overlay aktif
    document.body.style.overflow = 'hidden';

    let sudahBuka = false;

    function bukaUndangan() {
      if (sudahBuka) return;
      sudahBuka = true;

      // Animasi overlay keluar
      overlay.classList.add('terbuka');

      // Putar musik
      if (backsound) {
        backsound.play().then(() => {
          if (btnMusik) btnMusik.classList.add('aktif');
        }).catch(() => {
          console.warn('⚠️ Autoplay ditolak browser, klik tombol gong untuk memutar musik.');
        });
      }

      // Aktifkan scroll
      document.body.style.overflow = 'auto';

      // Sembunyikan overlay setelah animasi selasai
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 700);
    }

    // Trigger 1: Klik tombol Buka Undangan
    btn.addEventListener('click', bukaUndangan);

    // Trigger 2: Klik di area overlay (luar kotak konten)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        bukaUndangan();
      }
    });

    // Trigger 3: Tekan tombol Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sudahBuka) {
        bukaUndangan();
      }
    });

    // Trigger 4: Fallback auto-buka setelah 15 detik
    setTimeout(() => {
      if (!sudahBuka) {
        console.warn('⚠️ Auto-buka undangan setelah 15 detik (fallback)');
        bukaUndangan();
      }
    }, 15000);
  }

  /* ============================================
     3. MODAL POPUP GALERI
     ============================================ */
  function initModalGaleri() {
    const modal = document.getElementById('modalGaleri');
    if (!modal) return;

    // Tutup galeri jika area hitam di luar konten diklik
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Tutup galeri jika menekan tombol Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
      }
    });
  }

  /* ============================================
     4. FORM UCAPAN & DOA
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
     5. SALIN REKENING
     ============================================ */
  function initSalinRekening() {
    document.querySelectorAll('.tombol-salin').forEach(btn => {
      btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const nomor = this.getAttribute('data-nomor');
        
        if (!nomor) return;

        const el = document.getElementById(targetId);

        function suksesCopy() {
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
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(nomor).then(suksesCopy).catch(() => {
            fallbackCopy(nomor, suksesCopy);
          });
        } else {
          fallbackCopy(nomor, suksesCopy);
        }
      });
    });
  }

  function fallbackCopy(text, callback) {
    try {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      callback();
    } catch (err) {
      alert('Nomor rekening: ' + text);
    }
  }

  /* ============================================
     6. SCROLL REVEAL (EFEK MUNCUL SAAT SCROLL)
     ============================================ */
  function initScrollReveal() {
    // Memilih elemen utama di luar modal galeri
    const elemen = document.querySelectorAll(
      'section:not(.galeri-jawa) .kartu-pengantin, .kartu-momen, ' +
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
     7. COUNTDOWN HITUNG MUNDUR
     ============================================ */
  function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

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
     8. TOMBOL KE ATAS
     ============================================ */
  function initTombolKeAtas() {
    const btn = document.getElementById('keAtas');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('tampil');
      } else {
        btn.classList.remove('tampil');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================
     9. SHARE WHATSAPP
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
      
      window.open('https://api.whatsapp.com/send?text=' + pesan, '_blank');
    });
  }

  /* ============================================
     10. SMOOTH SCROLL
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
     UTILITIES / HELPER
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
    initBukaUndangan();
    initModalGaleri();
    initFormUcapan();
    initSalinRekening();
    initScrollReveal();
    initCountdown();
    initTombolKeAtas();
    initShareWA();
    initSmoothScroll();
    
    console.log('✅ Undangan Pernikahan Adat Jawa v4.0 siap!');
  });

})();
           
