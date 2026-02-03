import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';


@Component({
  selector: 'app-scan',
  imports: [],
  templateUrl: './scan.html',
  styleUrl: './scan.css',
})
export class Scan {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  
  // Estados
  isProcessing: boolean = false;
  hasFlashlight: boolean = false;
  flashlightOn: boolean = false;
  showHelpModal: boolean = false;
  cameraError: string = '';
  
  // Instancias
  private html5QrCode: Html5Qrcode | null = null;
  private mediaStream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Verificar permisos de cámara al iniciar
    this.checkCameraPermission();
  }

  ngAfterViewInit(): void {
    // Iniciar cámara después de que la vista esté lista
    setTimeout(() => {
      this.startCamera();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar recursos al destruir el componente
    this.stopCamera();
  }

  /**
   * Verificar permisos de cámara
   */
  private async checkCameraPermission(): Promise<void> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (result.state === 'denied') {
        this.cameraError = 'Necesitamos acceso a tu cámara para escanear el QR';
      }
      
      // Escuchar cambios en los permisos
      result.addEventListener('change', () => {
        if (result.state === 'granted') {
          this.cameraError = '';
          this.startCamera();
        }
      });
    } catch (error) {
      console.log('Permissions API not supported');
    }
  }

  /**
   * Iniciar cámara y scanner QR
   */
  private async startCamera(): Promise<void> {
    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.cameraError = 'Tu navegador no soporta acceso a la cámara';
        return;
      }

      // Configuración de la cámara
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      // Obtener stream de video
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Asignar stream al elemento video
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.mediaStream;
      }

      // Obtener track de video para controlar linterna
      this.videoTrack = this.mediaStream.getVideoTracks()[0];
      
      // Verificar si tiene linterna
      this.checkFlashlightCapability();

      // Iniciar scanner QR
      this.initQrScanner();

    } catch (error: any) {
      console.error('Error starting camera:', error);
      this.handleCameraError(error);
    }
  }

  /**
   * Inicializar scanner de QR con html5-qrcode
   */
  private async initQrScanner(): Promise<void> {
    try {
      this.html5QrCode = new Html5Qrcode('qr-reader');
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        this.onScanSuccess.bind(this),
        this.onScanFailure.bind(this)
      );

    } catch (error) {
      console.error('Error initializing QR scanner:', error);
    }
  }

  /**
   * Callback cuando se detecta un QR exitosamente
   */
  private onScanSuccess(decodedText: string, decodedResult: any): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Vibración de feedback (si está disponible)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    console.log('QR Scanned:', decodedText);

    // Parsear URL del QR
    // Esperamos algo como: "https://cafeya.com/mesa/5" o "mesa-5"
    const mesaId = this.extractMesaId(decodedText);
    
    if (mesaId) {
      // Detener scanner antes de navegar
      this.stopCamera();
      
      // Navegar a validación
      this.router.navigate(['/validate', mesaId]);
    } else {
      // QR inválido
      this.isProcessing = false;
      this.showError('QR no válido. Asegurate de escanear el código de CafeYa.');
    }
  }

  /**
   * Callback para errores de escaneo (se ejecuta constantemente)
   */
  private onScanFailure(error: string): void {
    // No hacer nada, es normal que falle mientras busca el QR
    // console.log('Scan error:', error);
  }

  /**
   * Extraer ID de mesa del QR
   */
  private extractMesaId(qrText: string): string | null {
    try {
      // Caso 1: URL completa (https://cafeya.com/mesa/5)
      if (qrText.includes('http')) {
        const url = new URL(qrText);
        const pathParts = url.pathname.split('/');
        const mesaIndex = pathParts.indexOf('mesa');
        
        if (mesaIndex !== -1 && pathParts[mesaIndex + 1]) {
          return `mesa-${pathParts[mesaIndex + 1]}`;
        }
      }
      
      // Caso 2: Formato directo (mesa-5 o mesa:5)
      if (qrText.toLowerCase().includes('mesa')) {
        const match = qrText.match(/mesa[-:]?(\d+)/i);
        if (match && match[1]) {
          return `mesa-${match[1]}`;
        }
      }
      
      // Caso 3: Solo número (asumimos que es el número de mesa)
      if (/^\d+$/.test(qrText)) {
        return `mesa-${qrText}`;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing QR:', error);
      return null;
    }
  }

  /**
   * Verificar si el dispositivo tiene linterna
   */
  private checkFlashlightCapability(): void {
    if (this.videoTrack) {
      const capabilities = this.videoTrack.getCapabilities();
      this.hasFlashlight = 'torch' in capabilities;
    }
  }

  /**
   * Toggle linterna
   */
  async toggleFlashlight(): Promise<void> {
    if (!this.videoTrack || !this.hasFlashlight) return;

    try {
      await this.videoTrack.applyConstraints({
        // @ts-ignore - torch no está en los tipos estándar
        advanced: [{ torch: !this.flashlightOn }]
      });
      
      this.flashlightOn = !this.flashlightOn;
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      this.showError('No se pudo activar la linterna');
    }
  }

  /**
   * Detener cámara y liberar recursos
   */
  private stopCamera(): void {
    // Detener scanner QR
    if (this.html5QrCode) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode?.clear();
        this.html5QrCode = null;
      }).catch(error => {
        console.error('Error stopping scanner:', error);
      });
    }

    // Apagar linterna si está encendida
    if (this.flashlightOn && this.videoTrack) {
      this.videoTrack.applyConstraints({
        // @ts-ignore
        advanced: [{ torch: false }]
      }).catch(console.error);
    }

    // Detener stream de video
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.videoTrack = null;
  }

  /**
   * Manejar errores de cámara
   */
  private handleCameraError(error: any): void {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      this.cameraError = 'Necesitamos permiso para acceder a tu cámara';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      this.cameraError = 'No se encontró ninguna cámara en tu dispositivo';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      this.cameraError = 'La cámara está siendo usada por otra aplicación';
    } else {
      this.cameraError = 'Error al acceder a la cámara. Intentá nuevamente.';
    }
  }

  /**
   * Mostrar error temporal
   */
  private showError(message: string): void {
    // Implementar sistema de toasts/alerts según tu preferencia
    alert(message);
  }

  /**
   * Ir a input manual
   */
  manualInput(): void {
    this.stopCamera();
    this.router.navigate(['/manual-input']);
  }

  /**
   * Mostrar modal de ayuda
   */
  showHelp(): void {
    this.showHelpModal = true;
  }

  /**
   * Cerrar modal de ayuda
   */
  closeHelp(): void {
    this.showHelpModal = false;
  }

  /**
   * Volver atrás
   */
  goBack(): void {
    this.stopCamera();
    this.router.navigate(['/']);
  }
}